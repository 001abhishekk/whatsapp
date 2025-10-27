import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Bot, ToggleLeft, Trash2 } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_value: string | null;
  is_active: boolean;
  response_type: string;
  response_content: string | null;
  created_at: string;
}

interface AutomationPageProps {
  businessId: string;
}

export default function AutomationPage({ businessId }: AutomationPageProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    triggerType: 'keyword',
    triggerValue: '',
    responseContent: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRules();
  }, [businessId]);

  const loadRules = async () => {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('business_id', businessId)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error loading rules:', error);
      return;
    }

    setRules(data || []);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('automation_rules').insert({
        business_id: businessId,
        name: newRule.name,
        trigger_type: newRule.triggerType,
        trigger_value: newRule.triggerValue || null,
        response_type: 'text',
        response_content: newRule.responseContent,
        is_active: true,
        priority: 0,
      });

      if (error) throw error;

      setNewRule({ name: '', triggerType: 'keyword', triggerValue: '', responseContent: '' });
      setShowCreateModal(false);
      loadRules();
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('automation_rules')
      .update({ is_active: !currentStatus })
      .eq('id', ruleId);

    if (error) {
      console.error('Error toggling rule:', error);
      return;
    }

    loadRules();
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      console.error('Error deleting rule:', error);
      return;
    }

    loadRules();
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Automation Rules</h2>
            <p className="text-gray-600 mt-1">Automate responses based on triggers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Rule</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {rules.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No automation rules yet</h3>
              <p className="text-gray-500 mb-6">Create automated responses to save time</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Rule</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <div key={rule.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bot className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Trigger:</span>{' '}
                          {rule.trigger_type === 'keyword' && `Keyword: "${rule.trigger_value}"`}
                          {rule.trigger_type === 'new_conversation' && 'New conversation'}
                          {rule.trigger_type === 'business_hours' && 'Outside business hours'}
                        </p>
                        {rule.response_content && (
                          <p>
                            <span className="font-medium">Response:</span>{' '}
                            {rule.response_content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.is_active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ToggleLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Automation Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="Welcome message"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trigger Type *
                </label>
                <select
                  value={newRule.triggerType}
                  onChange={(e) => setNewRule({ ...newRule, triggerType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                >
                  <option value="keyword">Keyword</option>
                  <option value="new_conversation">New Conversation</option>
                  <option value="business_hours">Outside Business Hours</option>
                </select>
              </div>
              {newRule.triggerType === 'keyword' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keyword
                  </label>
                  <input
                    type="text"
                    value={newRule.triggerValue}
                    onChange={(e) => setNewRule({ ...newRule, triggerValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="hello, help, pricing"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Message *
                </label>
                <textarea
                  value={newRule.responseContent}
                  onChange={(e) => setNewRule({ ...newRule, responseContent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="Thank you for contacting us! How can we help you today?"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
