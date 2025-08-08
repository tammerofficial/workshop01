<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CriticalErrorNotification extends Mailable
{
    use Queueable, SerializesModels;

    public array $errorData;
    public array $recipient;

    /**
     * Create a new message instance.
     */
    public function __construct(array $errorData, array $recipient)
    {
        $this->errorData = $errorData;
        $this->recipient = $recipient;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $severity = $this->getSeverityLevel();
        $environment = strtoupper($this->errorData['environment'] ?? 'UNKNOWN');
        
        return new Envelope(
            subject: "🚨 [{$environment}] Critical Error - {$this->errorData['type']}",
            tags: ['critical-error', 'monitoring', $environment],
            metadata: [
                'error_type' => $this->errorData['type'],
                'environment' => $this->errorData['environment'],
                'timestamp' => $this->errorData['timestamp'],
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.critical-error',
            text: 'emails.critical-error-text',
            with: [
                'errorData' => $this->errorData,
                'recipient' => $this->recipient,
                'severity' => $this->getSeverityLevel(),
                'dashboardUrl' => $this->getDashboardUrl(),
                'troubleshootingSteps' => $this->getTroubleshootingSteps(),
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
     * Determine error severity level
     */
    private function getSeverityLevel(): string
    {
        $errorType = $this->errorData['type'];
        
        if (str_contains($errorType, 'Fatal') || str_contains($errorType, 'Error')) {
            return 'CRITICAL';
        }
        
        if (str_contains($errorType, 'Database') || str_contains($errorType, 'PDO')) {
            return 'HIGH';
        }
        
        return 'MEDIUM';
    }

    /**
     * Get dashboard URL for error details
     */
    private function getDashboardUrl(): string
    {
        $baseUrl = config('app.url');
        return "{$baseUrl}/error-monitoring";
    }

    /**
     * Get troubleshooting steps based on error type
     */
    private function getTroubleshootingSteps(): array
    {
        $errorType = $this->errorData['type'];
        $message = strtolower($this->errorData['message']);
        
        if (str_contains($errorType, 'Database') || str_contains($message, 'database')) {
            return [
                'Check database server status and connectivity',
                'Verify database credentials in .env file',
                'Check for database locks or long-running queries',
                'Review recent database migrations or changes',
                'Monitor database disk space and memory usage',
            ];
        }
        
        if (str_contains($message, 'memory') || str_contains($message, 'out of memory')) {
            return [
                'Check current memory usage and available resources',
                'Review memory_limit setting in PHP configuration',
                'Identify memory-intensive operations or queries',
                'Consider optimizing data processing or using queues',
                'Monitor for memory leaks in application code',
            ];
        }
        
        if (str_contains($message, 'permission') || str_contains($message, 'access denied')) {
            return [
                'Verify file and directory permissions',
                'Check user authentication and authorization',
                'Review recent permission or role changes',
                'Ensure proper access controls are in place',
                'Validate API keys and tokens',
            ];
        }
        
        return [
            'Review error logs and stack trace for additional context',
            'Check recent code deployments or configuration changes',
            'Verify system resources (CPU, memory, disk space)',
            'Monitor application performance metrics',
            'Consider implementing additional error handling',
        ];
    }
}