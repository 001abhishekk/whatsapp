import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, MessageSquare, Users, Send, BarChart3 } from 'lucide-react';

interface AnalyticsPageProps {
  businessId: string;
}

export default function AnalyticsPage({ businessId }: AnalyticsPageProps) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalContacts: 0,
    totalConversations: 0,
    totalCampaigns: 0,
    messagesThisWeek: 0,
    newContactsThisWeek: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [businessId]);

  const loadAnalytics = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [messages, contacts, conversations, campaigns, recentMessages, recentContacts] = await Promise.all([
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
      supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('business_id', businessId),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', oneWeekAgo.toISOString()),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', oneWeekAgo.toISOString()),
    ]);

    setStats({
      totalMessages: messages.count || 0,
      totalContacts: contacts.count || 0,
      totalConversations: conversations.count || 0,
      totalCampaigns: campaigns.count || 0,
      messagesThisWeek: recentMessages.count || 0,
      newContactsThisWeek: recentContacts.count || 0,
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your WhatsApp business performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                {stats.messagesThisWeek}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalMessages}</h3>
            <p className="text-sm text-gray-600">Total Messages</p>
            <p className="text-xs text-gray-500 mt-2">{stats.messagesThisWeek} this week</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                {stats.newContactsThisWeek}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalContacts}</h3>
            <p className="text-sm text-gray-600">Total Contacts</p>
            <p className="text-xs text-gray-500 mt-2">{stats.newContactsThisWeek} new this week</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalConversations}</h3>
            <p className="text-sm text-gray-600">Active Conversations</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCampaigns}</h3>
            <p className="text-sm text-gray-600">Total Campaigns</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalMessages > 0 ? Math.round((stats.messagesThisWeek / stats.totalMessages) * 100) : 0}%
            </h3>
            <p className="text-sm text-gray-600">Activity Rate</p>
            <p className="text-xs text-gray-500 mt-2">Last 7 days vs total</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalContacts > 0 ? (stats.totalConversations / stats.totalContacts * 100).toFixed(1) : 0}%
            </h3>
            <p className="text-sm text-gray-600">Engagement Rate</p>
            <p className="text-xs text-gray-500 mt-2">Conversations per contact</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Average Response Time</p>
                  <p className="text-sm text-gray-600">Monitor how quickly you respond to customers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contact Growth</p>
                  <p className="text-sm text-gray-600">Your contact list is growing steadily</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Campaign Performance</p>
                  <p className="text-sm text-gray-600">Track delivery and engagement rates</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">Set up automation rules</p>
                <p className="text-xs text-blue-700 mt-1">Save time with automated responses</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm font-medium text-emerald-900">Create message templates</p>
                <p className="text-xs text-emerald-700 mt-1">Streamline your broadcast campaigns</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900">Import your contacts</p>
                <p className="text-xs text-purple-700 mt-1">Start engaging with your customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
