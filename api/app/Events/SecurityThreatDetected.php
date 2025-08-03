<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SecurityThreatDetected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $threat;
    public $severity;
    public $user;
    public $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct($threat, $severity, $user = null)
    {
        $this->threat = $threat;
        $this->severity = $severity;
        $this->user = $user;
        $this->timestamp = now();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('security-dashboard'),
            new PrivateChannel('security-alerts'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'security.threat.detected';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'threat' => $this->threat,
            'severity' => $this->severity,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null,
            'timestamp' => $this->timestamp->toISOString(),
        ];
    }
}