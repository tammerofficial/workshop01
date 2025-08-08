<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Critical Error Alert</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
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
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .alert-badge {
            background-color: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
        }
        .content {
            padding: 30px;
        }
        .error-summary {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .error-details {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            border: 1px solid #e5e7eb;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .info-item {
            background-color: #f3f4f6;
            padding: 12px;
            border-radius: 4px;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            color: #111827;
            word-break: break-all;
        }
        .troubleshooting {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .troubleshooting h3 {
            color: #1e40af;
            margin-top: 0;
        }
        .troubleshooting ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .troubleshooting li {
            margin: 5px 0;
        }
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #dc2626;
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
        .severity-critical { color: #dc2626; }
        .severity-high { color: #ea580c; }
        .severity-medium { color: #d97706; }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .btn {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Critical Error Alert</h1>
            <div class="alert-badge severity-{{ strtolower($severity) }}">
                {{ $severity }} PRIORITY
            </div>
        </div>
        
        <div class="content">
            <div class="error-summary">
                <h2 style="margin-top: 0; color: #dc2626;">Error Summary</h2>
                <p><strong>Type:</strong> {{ $errorData['type'] }}</p>
                <p><strong>Message:</strong> {{ $errorData['message'] }}</p>
                <p><strong>Time:</strong> {{ date('F j, Y g:i A', strtotime($errorData['timestamp'])) }}</p>
                <p><strong>Environment:</strong> {{ strtoupper($errorData['environment']) }}</p>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">File Location</div>
                    <div class="info-value">{{ $errorData['file'] }}:{{ $errorData['line'] }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Request URL</div>
                    <div class="info-value">{{ $errorData['url'] }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">HTTP Method</div>
                    <div class="info-value">{{ $errorData['method'] }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">User IP</div>
                    <div class="info-value">{{ $errorData['ip'] }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Server</div>
                    <div class="info-value">{{ $errorData['server_name'] }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Memory Usage</div>
                    <div class="info-value">{{ round($errorData['system_info']['memory_usage'] / 1024 / 1024, 2) }} MB</div>
                </div>
            </div>

            @if(isset($errorData['context']) && !empty($errorData['context']))
            <div class="error-details">
                <strong>Additional Context:</strong>
                <pre>{{ json_encode($errorData['context'], JSON_PRETTY_PRINT) }}</pre>
            </div>
            @endif

            <div class="error-details">
                <strong>Stack Trace:</strong>
                <pre>{{ $errorData['trace'] }}</pre>
            </div>

            @if(!empty($troubleshootingSteps))
            <div class="troubleshooting">
                <h3>🔧 Troubleshooting Steps</h3>
                <ul>
                    @foreach($troubleshootingSteps as $step)
                        <li>{{ $step }}</li>
                    @endforeach
                </ul>
            </div>
            @endif

            <div class="action-buttons">
                <a href="{{ $dashboardUrl }}" class="btn">View Error Dashboard</a>
                <a href="{{ $dashboardUrl }}?filter=severity:critical" class="btn btn-secondary">View All Critical Errors</a>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #0369a1;">
                    <strong>📧 Notification Settings:</strong> 
                    This email was sent to {{ $recipient['email'] }} because you are configured to receive {{ $recipient['severity_threshold'] ?? 'critical' }} error notifications.
                </p>
            </div>
        </div>

        <div class="footer">
            <p>
                This is an automated notification from {{ config('app.name') }}<br>
                Generated at {{ date('F j, Y g:i A T') }}<br>
                Environment: {{ strtoupper($errorData['environment']) }} | PHP {{ $errorData['system_info']['php_version'] }} | Laravel {{ $errorData['system_info']['laravel_version'] }}
            </p>
            <p style="margin-top: 15px;">
                <strong>Need help?</strong> Contact your system administrator or check the 
                <a href="{{ $dashboardUrl }}" style="color: #3b82f6;">error monitoring dashboard</a>
            </p>
        </div>
    </div>
</body>
</html>