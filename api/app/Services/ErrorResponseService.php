<?php

namespace App\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

class ErrorResponseService
{
    /**
     * Handle exception and return unified JSON response
     */
    public function handle(Throwable $exception, Request $request): JsonResponse
    {
        $response = $this->buildErrorResponse($exception, $request);
        
        return response()->json($response, $response['status_code']);
    }
    
    /**
     * Build standardized error response
     */
    private function buildErrorResponse(Throwable $exception, Request $request): array
    {
        $errorCode = $this->getErrorCode($exception);
        $statusCode = $this->getStatusCode($exception);
        $message = $this->getErrorMessage($exception);
        $details = $this->getErrorDetails($exception, $request);
        
        return [
            'success' => false,
            'error' => $message,
            'code' => $errorCode,
            'status_code' => $statusCode,
            'details' => $details,
            'timestamp' => now()->toISOString(),
            'request_id' => $request->header('X-Request-ID', uniqid('req_'))
        ];
    }
    
    /**
     * Get error code based on exception type
     */
    private function getErrorCode(Throwable $exception): string
    {
        return match (get_class($exception)) {
            ModelNotFoundException::class => 'RESOURCE_NOT_FOUND',
            NotFoundHttpException::class => 'ENDPOINT_NOT_FOUND',
            ValidationException::class => 'VALIDATION_ERROR',
            AuthenticationException::class => 'AUTHENTICATION_REQUIRED',
            AuthorizationException::class => 'AUTHORIZATION_DENIED',
            QueryException::class => 'DATABASE_ERROR',
            TooManyRequestsHttpException::class => 'RATE_LIMIT_EXCEEDED',
            default => 'INTERNAL_SERVER_ERROR'
        };
    }
    
    /**
     * Get HTTP status code based on exception type
     */
    private function getStatusCode(Throwable $exception): int
    {
        return match (get_class($exception)) {
            ModelNotFoundException::class,
            NotFoundHttpException::class => 404,
            ValidationException::class => 422,
            AuthenticationException::class => 401,
            AuthorizationException::class => 403,
            TooManyRequestsHttpException::class => 429,
            QueryException::class => 500,
            default => 500
        };
    }
    
    /**
     * Get user-friendly error message
     */
    private function getErrorMessage(Throwable $exception): string
    {
        return match (get_class($exception)) {
            ModelNotFoundException::class => 'The requested resource was not found',
            NotFoundHttpException::class => 'The requested endpoint was not found',
            ValidationException::class => 'The provided data is invalid',
            AuthenticationException::class => 'Authentication is required to access this resource',
            AuthorizationException::class => 'You do not have permission to access this resource',
            QueryException::class => 'A database error occurred',
            TooManyRequestsHttpException::class => 'Too many requests. Please try again later',
            default => 'An unexpected error occurred'
        };
    }
    
    /**
     * Get detailed error information
     */
    private function getErrorDetails(Throwable $exception, Request $request): array
    {
        $details = [
            'path' => $request->path(),
            'method' => $request->method(),
        ];
        
        // Add specific details based on exception type
        if ($exception instanceof ValidationException) {
            $details['validation_errors'] = $exception->errors();
        }
        
        if ($exception instanceof ModelNotFoundException) {
            $details['model'] = $exception->getModel();
            $details['ids'] = $exception->getIds();
        }
        
        if ($exception instanceof QueryException) {
            $details['error_code'] = $exception->getCode();
            // Don't expose sensitive SQL in production
            if (app()->environment('local', 'testing')) {
                $details['sql'] = $exception->getSql();
            }
        }
        
        // Add stack trace only in development
        if (app()->environment('local', 'testing')) {
            $details['file'] = $exception->getFile();
            $details['line'] = $exception->getLine();
            $details['trace'] = array_slice($exception->getTrace(), 0, 5); // First 5 frames only
        }
        
        return $details;
    }
}