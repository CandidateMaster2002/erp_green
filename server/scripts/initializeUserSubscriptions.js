require('dotenv').config();
const { createPool } = require('mysql2');

let pool;

function getPool() {
  if (!pool) {
    pool = createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.MYSQL_DB,
      connectionLimit: 10,
    });
  }
  return pool;
}

const initializeUserSubscriptions = async () => {
  const pl = getPool();
  const connection = await pl.promise().getConnection();

  try {
    // Fetch all organisation
    const [organisations] = await connection.query('SELECT * FROM organisation');

    // Fetch free plan details
    const [freePlan] = await connection.query('SELECT * FROM subscription_plans WHERE plan_status = "free"');
    if (freePlan.length === 0) {
      console.error('Free Plan not found in subscription_plans table');
      return;
    }

    const freePlanId = freePlan[0].plan_id;

    // Set the start and end dates for the free plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    Promise.all(
      organisations.map(async (org) => {
        connection.query(
          `INSERT IGNORE INTO user_subscriptions (org_id, plan_id, start_date, end_date, subscription_status)
            VALUES (?, ?, ?, ?, ?)`,
          [org.org_id, freePlanId, startDate, endDate, 'active'],
        );
        connection.query('UPDATE organisation SET org_access = 1 WHERE org_id = ?', [org.org_id]);
      }),
    );
    console.log('User subscriptions initialized successfully.');
  } catch (error) {
    console.error('Error initializing user subscriptions', error);
  } finally {
    connection.release();
  }
};

initializeUserSubscriptions();
