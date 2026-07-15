import sqlite3

def migrate():
    try:
        conn = sqlite3.connect('finvest_ai.db')
        cursor = conn.cursor()
        print("Connected to database successfully")
        
        # Add columns to stocks table
        cursor.execute("ALTER TABLE stocks ADD COLUMN profit_alert_pct FLOAT;")
        print("Added profit_alert_pct column")
        
        cursor.execute("ALTER TABLE stocks ADD COLUMN last_notified_profit_pct FLOAT;")
        print("Added last_notified_profit_pct column")
        
        conn.commit()
    except sqlite3.OperationalError as e:
        # If columns already exist, it will throw an OperationalError. 
        # We can just print it and move on.
        print(f"Migration notice: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed")

if __name__ == '__main__':
    migrate()
