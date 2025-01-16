import { schedule } from '@netlify/functions';

const handler = schedule('*/5 * * * *', async (event) => {
  try {
    const response = await fetch(`${process.env.SITE_URL}/api/scheduler/automated-report`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error('Failed to trigger report generation');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Report scheduled successfully' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to schedule report' })
    };
  }
});

export { handler }; 