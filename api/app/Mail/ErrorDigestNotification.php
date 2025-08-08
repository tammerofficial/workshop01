<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ErrorDigestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public array $digestData;
    public array $recipient;

    /**
     * Create a new message instance.
     */
    public function __construct(array $digestData, array $recipient)
    {
        $this->digestData = $digestData;
        $this->recipient = $recipient;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $environment = strtoupper(config('app.env', 'UNKNOWN'));
        $date = $this->digestData['date'];
        $totalErrors = $this->digestData['summary']['total_errors'];
        
        return new Envelope(
            subject: "📊 [{$environment}] Daily Error Digest - {$date} ({$totalErrors} errors)",
            tags: ['error-digest', 'daily-report', $environment],
            metadata: [
                'date' => $date,
                'total_errors' => $totalErrors,
                'environment' => config('app.env'),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.error-digest',
            text: 'emails.error-digest-text',
            with: [
                'digestData' => $this->digestData,
                'recipient' => $this->recipient,
                'dashboardUrl' => $this->getDashboardUrl(),
                'healthStatus' => $this->getHealthStatus(),
                'recommendations' => $this->getRecommendations(),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Get dashboard URL
     */
    private function getDashboardUrl(): string
    {
        $baseUrl = config('app.url');
        return "{$baseUrl}/error-monitoring";
    }

    /**
     * Get formatted health status
     */
    private function getHealthStatus(): array
    {
        $health = $this->digestData['system_health'];
        
        return [
            'status' => $health['status'],
            'color' => $this->getStatusColor($health['status']),
            'icon' => $this->getStatusIcon($health['status']),
            'description' => $this->getStatusDescription($health['status']),
        ];
    }

    /**
     * Get status color for styling
     */
    private function getStatusColor(string $status): string
    {
        return match($status) {
            'healthy' => '#10B981',
            'attention' => '#F59E0B',
            'warning' => '#EF4444',
            'critical' => '#DC2626',
            default => '#6B7280',
        };
    }

    /**
     * Get status icon
     */
    private function getStatusIcon(string $status): string
    {
        return match($status) {
            'healthy' => '✅',
            'attention' => '⚠️',
            'warning' => '🔴',
            'critical' => '🚨',
            default => '❓',
        };
    }

    /**
     * Get status description
     */
    private function getStatusDescription(string $status): string
    {
        return match($status) {
            'healthy' => 'System is operating normally',
            'attention' => 'Minor issues detected, monitoring required',
            'warning' => 'Significant issues detected, action recommended',
            'critical' => 'Critical issues detected, immediate action required',
            default => 'Unknown system status',
        };
    }

    /**
     * Get recommendations based on error patterns
     */
    private function getRecommendations(): array
    {
        $summary = $this->digestData['summary'];
        $topErrors = $this->digestData['top_errors'];
        $recommendations = [];

        // Check for high error rates
        if ($summary['total_errors'] > 50) {
            $recommendations[] = [
                'type' => 'high_error_rate',
                'title' => 'High Error Rate Detected',
                'description' => "Your application generated {$summary['total_errors']} errors today, which is above the recommended threshold.",
                'action' => 'Review error patterns and implement preventive measures.',
                'priority' => 'high',
            ];
        }

        // Check for critical errors
        if ($summary['critical_errors'] > 0) {
            $recommendations[] = [
                'type' => 'critical_errors',
                'title' => 'Critical Errors Require Attention',
                'description' => "{$summary['critical_errors']} critical errors were detected that may affect system stability.",
                'action' => 'Investigate and resolve critical errors immediately.',
                'priority' => 'critical',
            ];
        }

        // Check for unresolved errors
        if ($summary['unresolved_errors'] > 10) {
            $recommendations[] = [
                'type' => 'unresolved_errors',
                'title' => 'Many Unresolved Errors',
                'description' => "{$summary['unresolved_errors']} errors remain unresolved and may indicate systemic issues.",
                'action' => 'Review and resolve pending errors to improve system health.',
                'priority' => 'medium',
            ];
        }

        // Check for recurring error patterns
        if (!empty($topErrors)) {
            $topError = $topErrors[0];
            if ($topError['count'] > 10) {
                $recommendations[] = [
                    'type' => 'recurring_error',
                    'title' => 'Recurring Error Pattern',
                    'description' => "'{$topError['type']}' occurred {$topError['count']} times, indicating a recurring issue.",
                    'action' => 'Implement a permanent fix for this recurring error pattern.',
                    'priority' => 'medium',
                ];
            }
        }

        // Add general recommendations if no specific issues
        if (empty($recommendations) && $summary['total_errors'] > 0) {
            $recommendations[] = [
                'type' => 'general',
                'title' => 'System Monitoring',
                'description' => 'Continue monitoring error patterns and system performance.',
                'action' => 'Maintain current error handling practices and review logs regularly.',
                'priority' => 'low',
            ];
        }

        return $recommendations;
    }
}