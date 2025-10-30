import React from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { format } from 'date-fns';
import  { formatCurrency } from '../../utils/formatCurrency';

const PaymentDetails = ({ payment, onEdit }) => {
  if (!payment) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {payment.reference || 'Payment Details'}
        </h2>
        <Badge color={payment.status === 'completed' ? 'green' : 'gray'}>
          {payment.status || 'pending'}
        </Badge>
      </div>

      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p><span className="font-medium">Payer:</span> {payment.payerName || '-'}</p>
        <p><span className="font-medium">Amount:</span> {formatCurrency(payment.amount)}</p>
        <p><span className="font-medium">Method:</span> {payment.method || '-'}</p>
        <p><span className="font-medium">Date:</span> {payment.date ? format(new Date(payment.date), 'PPpp') : '-'}</p>
        <p><span className="font-medium">Related Event:</span> {payment.relatedEvent || '—'}</p>
        <p><span className="font-medium">Notes:</span> {payment.notes || 'No additional notes'}</p>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onEdit}>Edit Payment</Button>
      </div>
    </div>
  );
};

export default PaymentDetails;
