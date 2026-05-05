/**
 * Behavior Analysis Page
 * Main page for behavior analysis and preference management
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import BehaviorAnalysisDashboard from '../../components/BehaviorAnalysis/BehaviorAnalysisDashboard.jsx';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/UI/Card.jsx';
import Button from '../../components/UI/Button.jsx';

const BehaviorAnalysisPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access behavior analysis features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Behavior Analysis</h1>
        <p className="text-gray-600">
          Understand your travel preferences through intelligent behavior tracking
        </p>
      </div>

      {/* Main Dashboard */}
      <BehaviorAnalysisDashboard userId={user.id} />
    </div>
  );
};

export default BehaviorAnalysisPage;
