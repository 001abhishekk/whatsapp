import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, Phone, Key, Save, Loader2 } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  description: string | null;
  whatsapp_phone_number_id: string | null;
  whatsapp_business_account_id: string | null;
  whatsapp_access_token: string | null;
  is_active: boolean;
}

interface SettingsPageProps {
  businessId: string;
}

export default function SettingsPage({ businessId }: SettingsPageProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'whatsapp'>('business');

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  const loadBusiness = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .maybeSingle();

    if (error) {
      console.error('Error loading business:', error);
      return;
    }

    setBusiness(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: business.name,
          email: business.email,
          phone: business.phone,
          description: business.description,
          whatsapp_phone_number_id: business.whatsapp_phone_number_id,
          whatsapp_business_account_id: business.whatsapp_business_account_id,
          whatsapp_access_token: business.whatsapp_access_token,
          is_active: !!(business.whatsapp_phone_number_id && business.whatsapp_access_token),
        })
        .eq('id', businessId);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!business) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">Manage your business profile and WhatsApp configuration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('business')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'business'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>Business Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'whatsapp'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                <span>WhatsApp API</span>
              </div>
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6">
            {activeTab === 'business' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={business.name}
                    onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={business.email || ''}
                    onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={business.phone || ''}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={business.description || ''}
                    onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Get your WhatsApp Business API credentials from your{' '}
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900 font-medium"
                    >
                      Meta for Developers Dashboard
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number ID
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={business.whatsapp_phone_number_id || ''}
                      onChange={(e) => setBusiness({ ...business, whatsapp_phone_number_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="123456789012345"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Account ID
                  </label>
                  <input
                    type="text"
                    value={business.whatsapp_business_account_id || ''}
                    onChange={(e) => setBusiness({ ...business, whatsapp_business_account_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="123456789012345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={business.whatsapp_access_token || ''}
                      onChange={(e) => setBusiness({ ...business, whatsapp_access_token: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="EAAxxxxxxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${business.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700">
                    WhatsApp Status: {business.is_active ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <Save className="w-4 h-4" />
                  <span>Settings saved successfully!</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
