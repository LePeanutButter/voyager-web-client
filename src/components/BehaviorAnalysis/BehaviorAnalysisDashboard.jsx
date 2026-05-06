/**
 * Behavior Analysis Dashboard Component
 * Displays user behavior patterns and preference updates
 */

import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, CardTitle } from '../UI/Card.jsx';
import Button from '../UI/Button.jsx';
import {
  getBehaviorSummary,
  analyzeUserBehavior,
  getDetectedPatterns,
  clearUserBehaviorData
} from '../../services/behaviorAnalysisService.js';

const getPatternTypeLabel = (patternType) => {
  const labels = {
    rejection_pattern: 'Rejection Pattern',
    preference_pattern: 'Preference Pattern',
    time_preference_pattern: 'Time Preference Pattern',
    budget_preference_pattern: 'Budget Preference Pattern',
  };
  return labels[patternType] || patternType;
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.8) return '#22c55e';
  if (confidence >= 0.6) return '#eab308';
  return '#ef4444';
};

function BehaviorSummaryCard({ summary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Behavior Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.total_interactions}</div>
            <div className="text-sm text-gray-600">Total Interactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.analysis_period_days}</div>
            <div className="text-sm text-gray-600">Analysis Period (days)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{summary.recent_patterns?.length || 0}</div>
            <div className="text-sm text-gray-600">Detected Patterns</div>
          </div>
        </div>

        {summary.interaction_breakdown && Object.keys(summary.interaction_breakdown).length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Interaction Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(summary.interaction_breakdown).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.category_breakdown && Object.keys(summary.category_breakdown).length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Category Preferences</h4>
            <div className="space-y-2">
              {Object.entries(summary.category_breakdown).map(([category, count]) => (
                <div key={category} className="flex justify-between">
                  <span className="capitalize">{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

BehaviorSummaryCard.propTypes = {
  summary: PropTypes.object.isRequired,
};

function PatternRow({ pattern }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold">{getPatternTypeLabel(pattern.pattern_type)}</h4>
        <div
          className="px-2 py-1 rounded text-white text-sm"
          style={{ backgroundColor: getConfidenceColor(pattern.confidence) }}
        >
          {(pattern.confidence * 100).toFixed(1)}% confidence
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <div>Frequency: {pattern.frequency} occurrences</div>
        <div>Last detected: {new Date(pattern.last_detected).toLocaleDateString()}</div>

        {pattern.context && Object.keys(pattern.context).length > 0 && (
          <div>
            <strong>Context:</strong>
            <ul className="ml-4 mt-1">
              {Object.entries(pattern.context).map(([key, value]) => (
                <li key={key}>
                  {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

PatternRow.propTypes = {
  pattern: PropTypes.object.isRequired,
};

function PatternsCard({ patterns }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detected Behavior Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <PatternRow key={pattern.id ?? pattern.pattern_type ?? index} pattern={pattern} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

PatternsCard.propTypes = {
  patterns: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function PreferenceUpdatesCard({ preferenceUpdate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Implicit Preference Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(preferenceUpdate.preference_changes).map(([category, change]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="capitalize">{category}</span>
              <div className="flex items-center gap-2">
                <div className={`w-20 h-2 rounded ${change > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  <div
                    className={`h-full rounded ${change > 0 ? 'bg-green-600' : 'bg-red-600'}`}
                    style={{ width: `${Math.abs(change) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}
                  {change.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Overall Confidence</span>
            <span>{(preferenceUpdate.confidence_score * 100).toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

PreferenceUpdatesCard.propTypes = {
  preferenceUpdate: PropTypes.object.isRequired,
};

function ActionsCard({ loading, onClearData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={onClearData}
            disabled={loading}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Clear All Behavior Data
          </Button>
          <p className="text-sm text-gray-600">
            Clearing behavior data will reset all learned preferences and patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

ActionsCard.propTypes = {
  loading: PropTypes.bool.isRequired,
  onClearData: PropTypes.func.isRequired,
};

const BehaviorAnalysisDashboard = ({ userId }) => {
  const [summary, setSummary] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [preferenceUpdate, setPreferenceUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisDays, setAnalysisDays] = useState(7);

  const loadBehaviorData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const summaryData = await getBehaviorSummary(userId, 30);
      setSummary(summaryData);

      const patternsData = await getDetectedPatterns(userId, analysisDays);
      setPatterns(patternsData.patterns || []);
    } catch (err) {
      setError(err.message || 'Failed to load behavior data');
    } finally {
      setLoading(false);
    }
  }, [userId, analysisDays]);

  useEffect(() => {
    if (userId) {
      loadBehaviorData();
    }
  }, [userId, loadBehaviorData]);

  const handleAnalyzeBehavior = async () => {
    setLoading(true);
    setError(null);

    try {
      const analysisData = await analyzeUserBehavior({
        userId,
        analysisPeriodDays: analysisDays,
        includePatterns: true,
        includePreferenceUpdates: true,
      });

      setPreferenceUpdate(analysisData);
      setPatterns(analysisData.detectedPatterns || []);
    } catch (err) {
      setError(err.message || 'Failed to analyze behavior');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (globalThis.confirm('Are you sure you want to clear all behavior data? This action cannot be undone.')) {
      try {
        await clearUserBehaviorData(userId);
        setSummary(null);
        setPatterns([]);
        setPreferenceUpdate(null);
        alert('Behavior data cleared successfully');
      } catch (err) {
        setError(err.message || 'Failed to clear behavior data');
      }
    }
  };

  if (!userId) {
    return (
      <Card>
        <CardContent>
          <p>Please select a user to view behavior analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const showPreferenceCard =
    preferenceUpdate &&
    preferenceUpdate.preference_changes &&
    Object.keys(preferenceUpdate.preference_changes).length > 0;

  return (
    <div className="behavior-analysis-dashboard space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Behavior Analysis</h2>
        <div className="flex gap-2">
          <select
            value={analysisDays}
            onChange={(e) => setAnalysisDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button onClick={handleAnalyzeBehavior} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Behavior'}
          </Button>
          <Button variant="outline" onClick={loadBehaviorData} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {summary && <BehaviorSummaryCard summary={summary} />}

      {patterns.length > 0 && <PatternsCard patterns={patterns} />}

      {showPreferenceCard && <PreferenceUpdatesCard preferenceUpdate={preferenceUpdate} />}

      <ActionsCard loading={loading} onClearData={handleClearData} />
    </div>
  );
};

BehaviorAnalysisDashboard.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default BehaviorAnalysisDashboard;
