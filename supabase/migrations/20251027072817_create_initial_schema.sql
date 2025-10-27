/*
  # WhatsApp Business API Management Platform - Initial Schema

  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Business name
      - `email` (text) - Business email
      - `phone` (text) - Business phone number
      - `logo_url` (text) - Business logo
      - `description` (text) - Business description
      - `whatsapp_phone_number_id` (text) - WhatsApp Phone Number ID from Meta
      - `whatsapp_business_account_id` (text) - Meta Business Account ID
      - `whatsapp_access_token` (text) - Encrypted access token
      - `webhook_verify_token` (text) - Token for webhook verification
      - `is_active` (boolean) - Whether WhatsApp is connected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `team_members`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `user_id` (uuid, references auth.users)
      - `role` (text) - admin, agent, viewer
      - `name` (text)
      - `email` (text)
      - `created_at` (timestamptz)

    - `contacts`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `phone` (text) - Customer phone number
      - `name` (text) - Customer name
      - `profile_pic_url` (text)
      - `tags` (text[]) - Array of tags
      - `notes` (text)
      - `last_message_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `conversations`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `contact_id` (uuid, references contacts)
      - `assigned_to` (uuid, references team_members, nullable)
      - `status` (text) - open, in_progress, resolved, closed
      - `last_message_at` (timestamptz)
      - `unread_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `messages`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `conversation_id` (uuid, references conversations)
      - `contact_id` (uuid, references contacts)
      - `whatsapp_message_id` (text) - WhatsApp's message ID
      - `direction` (text) - inbound, outbound
      - `type` (text) - text, image, video, audio, document, location, contact
      - `content` (text) - Message text content
      - `media_url` (text) - URL for media files
      - `media_mime_type` (text)
      - `status` (text) - sent, delivered, read, failed
      - `sent_by` (uuid, references team_members, nullable)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

    - `message_templates`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `template_id` (text) - Meta template ID
      - `name` (text)
      - `language` (text)
      - `category` (text) - marketing, utility, authentication
      - `status` (text) - approved, pending, rejected
      - `header_type` (text) - text, image, video, document, none
      - `header_content` (text)
      - `body_content` (text)
      - `footer_content` (text)
      - `buttons` (jsonb) - Array of button objects
      - `variables` (jsonb) - Template variables
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `campaigns`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `name` (text)
      - `template_id` (uuid, references message_templates)
      - `target_contacts` (uuid[]) - Array of contact IDs
      - `target_tags` (text[]) - Array of tags to target
      - `status` (text) - draft, scheduled, running, completed, failed
      - `scheduled_at` (timestamptz)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `total_recipients` (integer)
      - `sent_count` (integer)
      - `delivered_count` (integer)
      - `read_count` (integer)
      - `failed_count` (integer)
      - `created_by` (uuid, references team_members)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `automation_rules`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `name` (text)
      - `trigger_type` (text) - keyword, new_conversation, business_hours, inactivity
      - `trigger_value` (text)
      - `is_active` (boolean)
      - `response_type` (text) - text, template, assign
      - `response_content` (text)
      - `response_data` (jsonb)
      - `priority` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `conversation_notes`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `created_by` (uuid, references team_members)
      - `note` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their business data
    - Policies ensure team members can only access conversations from their business
    - Business owners have full access, team members have limited access based on role
*/

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  logo_url text,
  description text,
  whatsapp_phone_number_id text,
  whatsapp_business_account_id text,
  whatsapp_access_token text,
  webhook_verify_token text DEFAULT gen_random_uuid()::text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business"
  ON businesses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own business"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business"
  ON businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL DEFAULT 'agent',
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team in their business"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = team_members.business_id
      AND businesses.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Business owners can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = team_members.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses NOT NULL,
  phone text NOT NULL,
  name text,
  profile_pic_url text,
  tags text[] DEFAULT '{}',
  notes text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(business_id, phone)
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team members can manage contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team members can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses NOT NULL,
  contact_id uuid REFERENCES contacts NOT NULL,
  assigned_to uuid REFERENCES team_members,
  status text DEFAULT 'open',
  last_message_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(business_id, contact_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = conversations.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team members can manage conversations"
  ON conversations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = conversations.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses NOT NULL,
  conversation_id uuid REFERENCES conversations NOT NULL,
  contact_id uuid REFERENCES contacts NOT NULL,
  whatsapp_message_id text,
  direction text NOT NULL,
  type text DEFAULT 'text',
  content text,
  media_url text,
  media_mime_type text,
  status text DEFAULT 'sent',
  sent_by uuid REFERENCES team_members,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = messages.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team members can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = messages.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses NOT NULL,
  template_id text,
  name text NOT NULL,
  language text DEFAULT 'en',
  category text DEFAULT 'marketing',
  status text DEFAULT 'pending',
  header_type text DEFAULT 'none',
  header_content text,
  body_content text NOT NULL,
  footer_content text,
  buttons jsonb DEFAULT '[]',
  variables jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view templates"
  ON message_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = message_templates.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Business owners can manage templates"
  ON message_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = message_templates.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses NOT NULL,
  name text NOT NULL,
  template_id uuid REFERENCES message_templates,
  target_contacts uuid[],
  target_tags text[],
  status text DEFAULT 'draft',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  total_recipients integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  read_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_by uuid REFERENCES team_members,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team members can manage campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses NOT NULL,
  name text NOT NULL,
  trigger_type text NOT NULL,
  trigger_value text,
  is_active boolean DEFAULT true,
  response_type text NOT NULL,
  response_content text,
  response_data jsonb,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view automation rules"
  ON automation_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = automation_rules.business_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Business owners can manage automation rules"
  ON automation_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = automation_rules.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Create conversation_notes table
CREATE TABLE IF NOT EXISTS conversation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations NOT NULL,
  created_by uuid REFERENCES team_members NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversation_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view notes"
  ON conversation_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN businesses ON businesses.id = conversations.business_id
      WHERE conversations.id = conversation_notes.conversation_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.business_id = businesses.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Team members can create notes"
  ON conversation_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN businesses ON businesses.id = conversations.business_id
      WHERE conversations.id = conversation_notes.conversation_id
      AND (businesses.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.business_id = businesses.id
          AND tm.user_id = auth.uid()
          AND tm.id = conversation_notes.created_by
        )
      )
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();