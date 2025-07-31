<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InvoiceController extends Controller
{
    public function index(): JsonResponse
    {
        $invoices = Invoice::with(['client', 'order'])->get();
        return response()->json($invoices);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'order_id' => 'nullable|exists:orders,id',
            'invoice_number' => 'required|string|unique:invoices',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount' => 'nullable|numeric|min:0',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
        ]);

        $data = $request->all();
        $data['tax_amount'] = ($data['subtotal'] * ($data['tax_rate'] ?? 0)) / 100;
        $data['total_amount'] = $data['subtotal'] + $data['tax_amount'] - ($data['discount'] ?? 0);

        $invoice = Invoice::create($data);
        return response()->json($invoice->load(['client', 'order']), 201);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($invoice->load(['client', 'order']));
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'order_id' => 'nullable|exists:orders,id',
            'invoice_number' => 'required|string|unique:invoices,invoice_number,' . $invoice->id,
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount' => 'nullable|numeric|min:0',
            'status' => 'in:draft,sent,paid,overdue,cancelled',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'paid_date' => 'nullable|date',
        ]);

        $data = $request->all();
        $data['tax_amount'] = ($data['subtotal'] * ($data['tax_rate'] ?? 0)) / 100;
        $data['total_amount'] = $data['subtotal'] + $data['tax_amount'] - ($data['discount'] ?? 0);

        $invoice->update($data);
        return response()->json($invoice->load(['client', 'order']));
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();
        return response()->json(['message' => 'Invoice deleted successfully']);
    }

    public function markAsPaid(Invoice $invoice): JsonResponse
    {
        $invoice->update([
            'status' => 'paid',
            'paid_date' => now(),
        ]);

        return response()->json($invoice);
    }

    public function updateStatus(Request $request, Invoice $invoice)
    {
        $request->validate([
            'status' => 'required|in:draft,sent,paid,overdue,cancelled'
        ]);

        $invoice->update(['status' => $request->status]);
        
        return response()->json($invoice);
    }
} 