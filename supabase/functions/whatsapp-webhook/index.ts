import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string };
  video?: { id: string; mime_type: string };
  audio?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string; filename: string };
}

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);

    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token && challenge) {
        console.log('Webhook verification successful');
        return new Response(challenge, {
          status: 200,
          headers: corsHeaders,
        });
      }

      return new Response('Bad Request', {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (req.method === 'POST') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const payload: WebhookPayload = await req.json();

      if (payload.object !== 'whatsapp_business_account') {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          const { value } = change;
          const phoneNumberId = value.metadata.phone_number_id;

          const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('whatsapp_phone_number_id', phoneNumberId)
            .maybeSingle();

          if (!business) {
            console.error('Business not found for phone number:', phoneNumberId);
            continue;
          }

          if (value.messages) {
            for (const message of value.messages) {
              const contact = value.contacts?.[0];
              
              let contactRecord = await supabase
                .from('contacts')
                .select('id')
                .eq('business_id', business.id)
                .eq('phone', message.from)
                .maybeSingle();

              if (!contactRecord.data) {
                const { data: newContact } = await supabase
                  .from('contacts')
                  .insert({
                    business_id: business.id,
                    phone: message.from,
                    name: contact?.profile?.name || null,
                  })
                  .select('id')
                  .single();
                contactRecord = { data: newContact };
              }

              if (!contactRecord.data) continue;

              let conversationRecord = await supabase
                .from('conversations')
                .select('id')
                .eq('business_id', business.id)
                .eq('contact_id', contactRecord.data.id)
                .maybeSingle();

              if (!conversationRecord.data) {
                const { data: newConversation } = await supabase
                  .from('conversations')
                  .insert({
                    business_id: business.id,
                    contact_id: contactRecord.data.id,
                    status: 'open',
                  })
                  .select('id')
                  .single();
                conversationRecord = { data: newConversation };
              }

              if (!conversationRecord.data) continue;

              let content = '';
              let mediaUrl = null;
              let mediaMimeType = null;

              if (message.type === 'text' && message.text) {
                content = message.text.body;
              } else if (message.type === 'image' && message.image) {
                content = 'Image';
                mediaMimeType = message.image.mime_type;
              } else if (message.type === 'video' && message.video) {
                content = 'Video';
                mediaMimeType = message.video.mime_type;
              } else if (message.type === 'audio' && message.audio) {
                content = 'Audio';
                mediaMimeType = message.audio.mime_type;
              } else if (message.type === 'document' && message.document) {
                content = message.document.filename || 'Document';
                mediaMimeType = message.document.mime_type;
              }

              await supabase.from('messages').insert({
                business_id: business.id,
                conversation_id: conversationRecord.data.id,
                contact_id: contactRecord.data.id,
                whatsapp_message_id: message.id,
                direction: 'inbound',
                type: message.type,
                content,
                media_url: mediaUrl,
                media_mime_type: mediaMimeType,
                status: 'delivered',
                timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
              });

              await supabase
                .from('conversations')
                .update({
                  last_message_at: new Date().toISOString(),
                  unread_count: conversationRecord.data.unread_count + 1,
                })
                .eq('id', conversationRecord.data.id);

              await supabase
                .from('contacts')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', contactRecord.data.id);
            }
          }

          if (value.statuses) {
            for (const status of value.statuses) {
              await supabase
                .from('messages')
                .update({ status: status.status })
                .eq('whatsapp_message_id', status.id);
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});