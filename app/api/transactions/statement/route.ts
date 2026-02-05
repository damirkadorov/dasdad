import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTransactionsByUserId, getUserById } from '@/lib/db/database';
import { Transaction } from '@/lib/db/types';

// Helper function to format date for statement
function formatStatementDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function to format currency
function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(Math.abs(amount));
}

// GET - Get transaction statement (filtered by date range)
export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json'; // 'json' or 'csv'
    const currency = searchParams.get('currency'); // optional currency filter

    // Get user details
    const userData = await getUserById(user!.userId);
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get transactions for the user
    let transactions = await getTransactionsByUserId(user!.userId);

    // Filter by date range if provided
    if (startDate) {
      const start = new Date(startDate);
      transactions = transactions.filter(t => {
        const txDate = new Date(t.createdAt || t.timestamp || '');
        return txDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      transactions = transactions.filter(t => {
        const txDate = new Date(t.createdAt || t.timestamp || '');
        return txDate <= end;
      });
    }

    // Filter by currency if provided
    if (currency) {
      transactions = transactions.filter(t => t.currency === currency);
    }

    // Calculate summary statistics
    const summary = calculateSummary(transactions);

    if (format === 'csv') {
      // Generate CSV format
      const csv = generateCSV(transactions, userData.username);
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="statement_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON statement
    return NextResponse.json({
      statement: {
        generatedAt: new Date().toISOString(),
        accountHolder: userData.username,
        email: userData.email,
        period: {
          from: startDate || 'All time',
          to: endDate || 'Present'
        },
        currency: currency || 'All currencies',
        summary,
        transactions: transactions.map(t => ({
          id: t.id,
          date: formatStatementDate(t.createdAt || t.timestamp),
          type: t.type,
          description: t.description,
          amount: t.amount,
          currency: t.currency,
          formattedAmount: formatAmount(t.amount, t.currency),
          status: t.status || 'completed',
          reference: t.reference || t.id.substring(0, 8)
        }))
      }
    });
  } catch (error) {
    console.error('Get statement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateSummary(transactions: Transaction[]) {
  const totalIncoming = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalOutgoing = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Group by currency
  const byCurrency: Record<string, { incoming: number; outgoing: number; count: number }> = {};
  
  transactions.forEach(t => {
    if (!byCurrency[t.currency]) {
      byCurrency[t.currency] = { incoming: 0, outgoing: 0, count: 0 };
    }
    byCurrency[t.currency].count++;
    if (t.amount > 0) {
      byCurrency[t.currency].incoming += t.amount;
    } else {
      byCurrency[t.currency].outgoing += Math.abs(t.amount);
    }
  });

  // Group by type
  const byType: Record<string, number> = {};
  transactions.forEach(t => {
    byType[t.type] = (byType[t.type] || 0) + 1;
  });

  return {
    totalTransactions: transactions.length,
    totalIncoming,
    totalOutgoing,
    netChange: totalIncoming - totalOutgoing,
    byCurrency,
    byType
  };
}

function generateCSV(transactions: Transaction[], username: string): string {
  const header = 'Date,Type,Description,Amount,Currency,Status,Reference\n';
  
  const rows = transactions.map(t => {
    const date = formatStatementDate(t.createdAt || t.timestamp);
    const type = t.type;
    const description = (t.description || '').replace(/,/g, ';').replace(/"/g, "'").replace(/[\r\n]+/g, ' ');
    const amount = t.amount.toFixed(2);
    const currency = t.currency;
    const status = t.status || 'completed';
    const reference = t.reference || t.id.substring(0, 8);
    
    return `"${date}","${type}","${description}",${amount},"${currency}","${status}","${reference}"`;
  }).join('\n');

  const metadata = `# Transaction Statement\n# Account: ${username}\n# Generated: ${new Date().toISOString()}\n# Total Transactions: ${transactions.length}\n\n`;
  
  return metadata + header + rows;
}
