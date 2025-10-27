import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import LoginPage from './components/auth/LoginPage';
import BusinessSetup from './components/onboarding/BusinessSetup';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ConversationsPage from './components/conversations/ConversationsPage';
import ContactsPage from './components/contacts/ContactsPage';
import CampaignsPage from './components/campaigns/CampaignsPage';
import TemplatesPage from './components/templates/TemplatesPage';
import AutomationPage from './components/automation/AutomationPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import SettingsPage from './components/settings/SettingsPage';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('conversations');

  useEffect(() => {
    if (user) {
      checkBusiness();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkBusiness = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking business:', error);
    }

    setBusinessId(data?.id || null);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!businessId) {
    return <BusinessSetup onComplete={checkBusiness} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'conversations':
        return <ConversationsPage businessId={businessId} />;
      case 'contacts':
        return <ContactsPage businessId={businessId} />;
      case 'campaigns':
        return <CampaignsPage businessId={businessId} />;
      case 'templates':
        return <TemplatesPage businessId={businessId} />;
      case 'automation':
        return <AutomationPage businessId={businessId} />;
      case 'analytics':
        return <AnalyticsPage businessId={businessId} />;
      case 'settings':
        return <SettingsPage businessId={businessId} />;
      default:
        return <ConversationsPage businessId={businessId} />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}

export default App;
