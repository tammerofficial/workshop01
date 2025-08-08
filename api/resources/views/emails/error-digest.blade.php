<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Error Digest</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 25px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .date-badge {
            background-color: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
        }
        .content {
            padding: 30px;
        }
        .health-status {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .health-healthy { background-color: #dcfce7; border: 2px solid #10b981; }
        .health-attention { background-color: #fef3c7; border: 2px solid #f59e0b; }
        .health-warning { background-color: #fee2e2; border: 2px solid #ef4444; }
        .health-critical { background-color: #fecaca; border: 2px solid #dc2626; }
        
        .health-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }
        .stat-card {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
        }
        .stat-critical { color: #dc2626; }
        .stat-warning { color: #f59e0b; }
        .stat-info { color: #3b82f6; }
        
        .section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .section h3 {
            margin-top: 0;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .error-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .error-table th,
        .error-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .error-table th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
        }
        .error-table tr:hover {
            background-color: #f9fafb;
        }
        .severity-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .severity-critical { background-color: #fecaca; color: #991b1b; }
        .severity-high { background-color: #fed7aa; color: #9a3412; }
        .severity-medium { background-color: #fef3c7; color: #92400e; }
        .severity-low { background-color: #dbeafe; color: #1e40af; }
        
        .recommendations {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .recommendation-item {
            margin: 15px 0;
            padding: 15px;
            background-color: white;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
        }
        .recommendation-critical { border-left-color: #dc2626; }
        .recommendation-high { border-left-color: #ea580c; }
        .recommendation-medium { border-left-color: #d97706; }
        .recommendation-low { border-left-color: #059669; }
        
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 0 10px;
        }
        .btn-secondary {
            background-color: #6b7280;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }
        
        @media (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }
            .btn {
                display: block;
                margin: 10px 0;
            }
            .error-table {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Daily Error Digest</h1>
            <div class="date-badge">
                {{ date('F j, Y', strtotime($digestData['date'])) }}
            </div>
        </div>
        
        <div class="content">
            <!-- System Health Status -->
            <div class="health-status health-{{ $healthStatus['status'] }}">
                <div class="health-icon">{{ $healthStatus['icon'] }}</div>
                <h2 style="margin: 10px 0; color: {{ $healthStatus['color'] }};">
                    System Health: {{ ucfirst($healthStatus['status']) }}
                </h2>
                <p style="margin: 0; font-size: 16px;">{{ $healthStatus['description'] }}</p>
            </div>

            <!-- Statistics Overview -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number stat-info">{{ $digestData['summary']['total_errors'] }}</div>
                    <div class="stat-label">Total Errors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number stat-critical">{{ $digestData['summary']['critical_errors'] }}</div>
                    <div class="stat-label">Critical Errors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number stat-warning">{{ $digestData['summary']['unresolved_errors'] }}</div>
                    <div class="stat-label">Unresolved</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number stat-info">{{ round($digestData['system_health']['resolution_rate'] ?? 0, 1) }}%</div>
                    <div class="stat-label">Resolution Rate</div>
                </div>
            </div>

            <!-- Errors by Severity -->
            @if(!empty($digestData['summary']['by_severity']))
            <div class="section">
                <h3>📈 Errors by Severity</h3>
                <div class="stats-grid">
                    @foreach($digestData['summary']['by_severity'] as $severity => $count)
                    <div class="stat-card">
                        <div class="stat-number">{{ $count }}</div>
                        <div class="stat-label">{{ ucfirst($severity) }}</div>
                    </div>
                    @endforeach
                </div>
            </div>
            @endif

            <!-- Top Error Types -->
            @if(!empty($digestData['top_errors']))
            <div class="section">
                <h3>🔝 Most Frequent Errors</h3>
                <table class="error-table">
                    <thead>
                        <tr>
                            <th>Error Type</th>
                            <th>Count</th>
                            <th>Latest Occurrence</th>
                            <th>Message Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach(array_slice($digestData['top_errors'], 0, 10) as $error)
                        <tr>
                            <td><code>{{ basename($error['type']) }}</code></td>
                            <td><strong>{{ $error['count'] }}</strong></td>
                            <td>{{ date('g:i A', strtotime($error['latest'])) }}</td>
                            <td>{{ Str::limit($error['message'], 50) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif

            <!-- Recent Critical Errors -->
            @if(!empty($digestData['errors']))
            <div class="section">
                <h3>⚠️ Recent Errors Sample</h3>
                <table class="error-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Severity</th>
                            <th>Type</th>
                            <th>Message</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach(array_slice($digestData['errors'], 0, 10) as $error)
                        <tr>
                            <td>{{ date('g:i A', strtotime($error['created_at'])) }}</td>
                            <td>
                                <span class="severity-badge severity-{{ $error['severity'] }}">
                                    {{ $error['severity'] }}
                                </span>
                            </td>
                            <td><code>{{ basename($error['type']) }}</code></td>
                            <td>{{ Str::limit($error['message'], 60) }}</td>
                            <td>{{ $error['resolved'] ? '✅ Resolved' : '🔴 Open' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif

            <!-- Recommendations -->
            @if(!empty($recommendations))
            <div class="recommendations">
                <h3 style="color: #1e40af; margin-top: 0;">💡 Recommendations</h3>
                @foreach($recommendations as $rec)
                <div class="recommendation-item recommendation-{{ $rec['priority'] }}">
                    <h4 style="margin: 0 0 10px 0; color: #374151;">{{ $rec['title'] }}</h4>
                    <p style="margin: 0 0 10px 0; color: #6b7280;">{{ $rec['description'] }}</p>
                    <p style="margin: 0; font-weight: 600; color: #111827;">
                        <strong>Action:</strong> {{ $rec['action'] }}
                    </p>
                </div>
                @endforeach
            </div>
            @endif

            <!-- Action Buttons -->
            <div class="action-buttons">
                <a href="{{ $dashboardUrl }}" class="btn">View Full Dashboard</a>
                <a href="{{ $dashboardUrl }}?filter=unresolved" class="btn btn-secondary">Review Unresolved Errors</a>
            </div>

            <!-- Notification Info -->
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #0369a1;">
                    <strong>📧 Daily Digest:</strong> 
                    This digest was sent to {{ $recipient['email'] }}. 
                    @if($digestData['summary']['total_errors'] == 0)
                        Great news! No errors were recorded today.
                    @else
                        {{ $digestData['summary']['total_errors'] }} errors were recorded and analyzed.
                    @endif
                </p>
            </div>
        </div>

        <div class="footer">
            <p>
                This is an automated daily digest from {{ config('app.name') }}<br>
                Generated at {{ date('F j, Y g:i A T') }}<br>
                Environment: {{ strtoupper(config('app.env')) }}
            </p>
            <p style="margin-top: 15px;">
                <strong>Questions?</strong> Contact your system administrator or visit the 
                <a href="{{ $dashboardUrl }}" style="color: #3b82f6;">error monitoring dashboard</a>
            </p>
        </div>
    </div>
</body>
</html>