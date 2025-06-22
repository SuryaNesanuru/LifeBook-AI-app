import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { year, title } = await request.json();

    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch entries for the specified year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    // Create HTML content for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title || `My Life Story - ${year}`}</title>
          <style>
            body { 
              font-family: 'Georgia', serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 60px; 
              border-bottom: 2px solid #10b981;
              padding-bottom: 20px;
            }
            .title { 
              font-size: 36px; 
              color: #10b981; 
              margin-bottom: 10px; 
            }
            .subtitle { 
              font-size: 18px; 
              color: #666; 
            }
            .entry { 
              margin-bottom: 40px; 
              page-break-inside: avoid;
            }
            .entry-date { 
              font-size: 14px; 
              color: #10b981; 
              font-weight: bold; 
              margin-bottom: 10px;
            }
            .entry-title { 
              font-size: 24px; 
              color: #333; 
              margin-bottom: 15px; 
            }
            .entry-content { 
              font-size: 16px; 
              line-height: 1.8; 
            }
            .chapter { 
              page-break-before: always; 
              margin-top: 60px;
            }
            .chapter-title { 
              font-size: 28px; 
              color: #10b981; 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${title || `My Life Story`}</h1>
            <p class="subtitle">A year of reflections and growth • ${year}</p>
          </div>
          
          ${entries?.map((entry: any, index: number) => {
            const date = new Date(entry.created_at);
            const month = date.toLocaleString('default', { month: 'long' });
            const isNewMonth = index === 0 || 
              new Date(entries[index - 1].created_at).getMonth() !== date.getMonth();
            
            return `
              ${isNewMonth ? `<div class="chapter"><h2 class="chapter-title">${month} ${year}</h2></div>` : ''}
              <div class="entry">
                <div class="entry-date">${date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                <h3 class="entry-title">${entry.title}</h3>
                <div class="entry-content">${entry.content.replace(/\n/g, '<br>')}</div>
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `;

    // In a real implementation, you'd use a library like Puppeteer or jsPDF
    // For now, we'll return the HTML content that can be converted to PDF client-side
    return NextResponse.json({ 
      html: htmlContent,
      totalEntries: entries?.length || 0,
      title: title || `My Life Story - ${year}`
    });

  } catch (error) {
    console.error('POST /api/export/pdf error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}