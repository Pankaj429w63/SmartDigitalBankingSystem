"""
Smart Digital Banking System — Analytics Dashboard
Built with Python + Streamlit | Demonstrates NoSQL aggregation, data analytics, and visualization
"""

import os
import json
import random
import datetime
from pathlib import Path

import streamlit as st
import pandas as pd
import numpy as np

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

# ── Page Config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="SmartBank Analytics Dashboard",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* Dark glassmorphism theme */
    .stApp { background: linear-gradient(135deg, #0a0e1a 0%, #141929 100%); }
    [data-testid="stSidebar"] { background: rgba(20,25,41,0.95) !important; border-right: 1px solid rgba(255,255,255,0.08); }
    .metric-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        backdrop-filter: blur(10px);
    }
    .metric-value { font-size: 2rem; font-weight: 800; }
    .metric-label { color: #8892b0; font-size: 0.85rem; margin-top: 4px; }
    .section-header {
        font-size: 1.3rem; font-weight: 700;
        color: #f0f4ff; margin-bottom: 1rem;
        border-left: 4px solid #6c63ff;
        padding-left: 0.75rem;
    }
    h1, h2, h3, h4, h5 { color: #f0f4ff !important; }
    p, span, div { color: #c8d3e8; }
</style>
""", unsafe_allow_html=True)

# ── Simulated MongoDB / NoSQL Data (mimics aggregation pipeline results) ───────
@st.cache_data
def load_mongo_uri():
    env_path = Path(__file__).resolve().parents[1] / 'backend' / '.env'
    if env_path.exists():
        load_dotenv(env_path)
    return os.getenv('MONGO_URI', 'mongodb://localhost:27017/smartbankdb')


def fetch_transactions_from_mongodb(limit=500):
    uri = load_mongo_uri()
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        db_name = client.get_default_database().name if client.get_default_database() else 'smartbankdb'
        db = client[db_name]
        collection = db['transactions']
        raw_docs = list(collection.find({}, {'_id': 0}).sort('transactionDate', -1).limit(limit))
        if not raw_docs:
            return None, uri, 'No transactions found in MongoDB; falling back to mock data.'

        df = pd.DataFrame(raw_docs)
        if 'transactionDate' in df.columns:
            df['transactionDate'] = pd.to_datetime(df['transactionDate'])
        else:
            df['transactionDate'] = pd.to_datetime('today')

        if 'balanceAfter' not in df.columns:
            df['balanceAfter'] = df['amount'].cumsum()

        return df, uri, 'MongoDB data loaded successfully.'
    except PyMongoError as exc:
        return None, uri, f'MongoDB connection failed: {exc}'
    except Exception as exc:
        return None, uri, f'Unexpected MongoDB error: {exc}'


@st.cache_data
def generate_transaction_data(n=500):
    """
    Simulate data that would come from MongoDB aggregation pipelines.
    In production this would connect to:
        mongodb://localhost:27017/smartbankdb
    and run Transaction.aggregate([...]) calls.
    """
    random.seed(42)
    np.random.seed(42)

    categories   = ["salary","food","shopping","utilities","entertainment","healthcare","education","travel","investment","other"]
    types        = ["credit","debit","transfer","payment","withdrawal","deposit"]
    statuses     = ["completed","pending","failed"]
    names        = ["Rahul Sharma","Priya Singh","Amit Kumar","Neha Patel","Ravi Verma","Ananya Joshi"]

    start = datetime.datetime(2024, 1, 1)
    rows  = []
    balance = 50000.0

    for i in range(n):
        t_type    = random.choices(types, weights=[25,30,15,15,10,5])[0]
        amount    = round(random.uniform(100, 25000), 2)
        is_credit = t_type in ["credit", "deposit"]
        balance   = balance + amount if is_credit else max(0, balance - amount)
        date      = start + datetime.timedelta(days=random.randint(0, 450))
        rows.append({
            "referenceNumber": f"TXN{10000000+i}{random.randint(1000,9999)}",
            "type":        t_type,
            "amount":      amount,
            "category":    random.choice(categories),
            "status":      random.choices(statuses, weights=[85,10,5])[0],
            "balanceAfter":round(balance, 2),
            "description": f"{t_type.title()} - {random.choice(categories).title()}",
            "recipientName": random.choice(names) if t_type in ["transfer","payment"] else "",
            "transactionDate": date,
            "month":       date.strftime("%b %Y"),
            "day_of_week": date.strftime("%A"),
        })

    return pd.DataFrame(rows)

mongo_df, mongo_uri, mongo_message = fetch_transactions_from_mongodb()
if mongo_df is not None and not mongo_df.empty:
    df = mongo_df
    data_source = f"MongoDB ({mongo_uri})"
    source_status = "Connected to live database"
else:
    df = generate_transaction_data()
    data_source = "Mock MongoDB"
    source_status = mongo_message

# ── Sidebar ────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🏦 SmartBank")
    st.markdown("### Analytics Dashboard")
    st.divider()

    page = st.radio("Navigation", [
        "📊 Overview",
        "💳 Transactions",
        "📈 Monthly Trends",
        "🗂 Category Breakdown",
        "🔍 NoSQL Aggregation Demo",
        "📋 Syllabus Coverage"
    ])

    st.divider()

    # Filters
    st.markdown("#### Filters")
    selected_types = st.multiselect("Transaction Types", df["type"].unique().tolist(), default=df["type"].unique().tolist())
    date_range = st.date_input("Date Range", [df["transactionDate"].min(), df["transactionDate"].max()])

    st.divider()
    st.markdown("**Data Source**")
    st.info(f"🟢 {data_source}\n{source_status}")
filtered = df[df["type"].isin(selected_types)]
if len(date_range) == 2:
    filtered = filtered[
        (filtered["transactionDate"] >= pd.Timestamp(date_range[0])) &
        (filtered["transactionDate"] <= pd.Timestamp(date_range[1]))
    ]

# ── Helper: KPI Cards ──────────────────────────────────────────────────────────
def kpi(col, label, value, color="#6c63ff"):
    col.markdown(f"""
    <div class="metric-card">
        <div class="metric-value" style="color:{color};">{value}</div>
        <div class="metric-label">{label}</div>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════
if page == "📊 Overview":
    st.markdown("# 📊 SmartBank Overview")
    st.markdown("Real-time analytics powered by **NoSQL aggregation pipelines** (MongoDB)")
    st.divider()

    credits  = filtered[filtered["type"].isin(["credit","deposit"])]["amount"].sum()
    debits   = filtered[filtered["type"].isin(["debit","payment","withdrawal","transfer"])]["amount"].sum()
    net      = credits - debits
    total_tx = len(filtered)
    savings  = round((net / credits * 100), 1) if credits > 0 else 0

    c1, c2, c3, c4, c5 = st.columns(5)
    kpi(c1, "Total Credits",      f"₹{credits:,.0f}",   "#00d4aa")
    kpi(c2, "Total Debits",       f"₹{debits:,.0f}",    "#ff6b6b")
    kpi(c3, "Net Balance",        f"₹{net:,.0f}",        "#6c63ff")
    kpi(c4, "Transactions",       f"{total_tx:,}",       "#ffd93d")
    kpi(c5, "Savings Rate",       f"{savings}%",         "#f093fb")

    st.divider()

    col1, col2 = st.columns(2)

    with col1:
        st.markdown('<div class="section-header">Transaction Type Distribution</div>', unsafe_allow_html=True)
        type_counts = filtered["type"].value_counts()
        st.bar_chart(type_counts, color="#6c63ff")

    with col2:
        st.markdown('<div class="section-header">Status Distribution</div>', unsafe_allow_html=True)
        status_counts = filtered["status"].value_counts()
        st.bar_chart(status_counts, color="#00d4aa")

    st.markdown('<div class="section-header">Balance Over Time (Last 100 Transactions)</div>', unsafe_allow_html=True)
    balance_df = filtered.sort_values("transactionDate").tail(100)[["transactionDate","balanceAfter"]].set_index("transactionDate")
    st.line_chart(balance_df, color="#6c63ff")

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: TRANSACTIONS
# ══════════════════════════════════════════════════════════════════════════════
elif page == "💳 Transactions":
    st.markdown("# 💳 Transaction Ledger")
    st.markdown("Full CRUD-ready transaction table (MongoDB Collection: `transactions`)")
    st.divider()

    search = st.text_input("🔍 Search description or reference number", "")
    if search:
        mask = (filtered["description"].str.contains(search, case=False) |
                filtered["referenceNumber"].str.contains(search, case=False))
        filtered = filtered[mask]

    cols = ["referenceNumber","transactionDate","type","amount","category","status","balanceAfter"]
    display = filtered[cols].sort_values("transactionDate", ascending=False).head(100).copy()
    display["amount"] = display["amount"].apply(lambda x: f"₹{x:,.2f}")
    display["balanceAfter"] = display["balanceAfter"].apply(lambda x: f"₹{x:,.2f}")
    display["transactionDate"] = display["transactionDate"].dt.strftime("%d %b %Y")

    st.dataframe(display, use_container_width=True, height=500)
    st.caption(f"Showing {len(display)} of {len(filtered)} records")

    csv = filtered.to_csv(index=False).encode("utf-8")
    st.download_button("⬇️ Download CSV", csv, "transactions.csv", "text/csv")

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: MONTHLY TRENDS
# ══════════════════════════════════════════════════════════════════════════════
elif page == "📈 Monthly Trends":
    st.markdown("# 📈 Monthly Spending Trends")
    st.markdown("Equivalent to `Transaction.getMonthlySpending()` aggregation pipeline")
    st.divider()

    monthly = (
        filtered
        .groupby("month")
        .agg(
            total_spent=("amount", "sum"),
            count=("amount", "count"),
            avg_amount=("amount", "mean")
        )
        .reset_index()
    )

    st.markdown('<div class="section-header">Monthly Transaction Volume (₹)</div>', unsafe_allow_html=True)
    st.bar_chart(monthly.set_index("month")["total_spent"], color="#6c63ff")

    st.markdown('<div class="section-header">Transaction Count per Month</div>', unsafe_allow_html=True)
    st.line_chart(monthly.set_index("month")["count"], color="#00d4aa")

    st.markdown('<div class="section-header">Monthly Summary Table</div>', unsafe_allow_html=True)
    monthly["total_spent"] = monthly["total_spent"].apply(lambda x: f"₹{x:,.2f}")
    monthly["avg_amount"]  = monthly["avg_amount"].apply(lambda x: f"₹{x:,.2f}")
    st.dataframe(monthly, use_container_width=True)

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: CATEGORY BREAKDOWN
# ══════════════════════════════════════════════════════════════════════════════
elif page == "🗂 Category Breakdown":
    st.markdown("# 🗂 Spending by Category")
    st.markdown("Equivalent to `Transaction.getCategoryBreakdown()` aggregation pipeline")
    st.divider()

    debit_df = filtered[filtered["type"].isin(["debit","payment","withdrawal"])]
    cat_df   = debit_df.groupby("category").agg(total=("amount","sum"), count=("amount","count")).reset_index().sort_values("total", ascending=False)

    c1, c2 = st.columns(2)
    with c1:
        st.markdown('<div class="section-header">Spending by Category (₹)</div>', unsafe_allow_html=True)
        st.bar_chart(cat_df.set_index("category")["total"], color="#f093fb")
    with c2:
        st.markdown('<div class="section-header">Transaction Count by Category</div>', unsafe_allow_html=True)
        st.bar_chart(cat_df.set_index("category")["count"], color="#ffd93d")

    st.markdown('<div class="section-header">Category Summary</div>', unsafe_allow_html=True)
    cat_df["total"] = cat_df["total"].apply(lambda x: f"₹{x:,.2f}")
    st.dataframe(cat_df, use_container_width=True)

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: NoSQL AGGREGATION DEMO
# ══════════════════════════════════════════════════════════════════════════════
elif page == "🔍 NoSQL Aggregation Demo":
    st.markdown("# 🔍 NoSQL / MongoDB Aggregation Pipeline Demo")
    st.divider()

    st.markdown("### 🗄 What is NoSQL?")
    st.info("""
**NoSQL (Not Only SQL)** databases store data in flexible, document-oriented formats instead of rigid tables.
**MongoDB** stores data as **JSON-like BSON documents** inside **Collections** (≈ tables) inside **Databases**.

- **Database** → `smartbankdb`  
- **Collection** → `transactions`, `users`  
- **Document** → A single transaction JSON object  
- **Connection String** → `mongodb://localhost:27017/smartbankdb`
    """)

    st.divider()
    st.markdown("### ⚙️ Aggregation Pipelines in this Project")

    tab1, tab2, tab3 = st.tabs(["getUserSummary()", "getMonthlySpending()", "getCategoryBreakdown()"])

    with tab1:
        st.code("""
// Transaction.js — Static Method (Aggregation Pipeline)
transactionSchema.statics.getUserSummary = async function(userId) {
  return await this.aggregate([
    // Stage 1: Filter documents for this user
    { $match: { user: new mongoose.Types.ObjectId(userId) } },

    // Stage 2: Group by transaction type, sum amount
    { $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count:       { $sum: 1 },
        avgAmount:   { $avg: '$amount' }
    }},

    // Stage 3: Sort by totalAmount descending
    { $sort: { totalAmount: -1 } }
  ]);
};
        """, language="javascript")
        # Run Python equivalent
        summary = filtered.groupby("type").agg(totalAmount=("amount","sum"), count=("amount","count"), avgAmount=("amount","mean")).reset_index().sort_values("totalAmount", ascending=False)
        st.markdown("**Live Result (Python equivalent):**")
        st.dataframe(summary, use_container_width=True)

    with tab2:
        st.code("""
transactionSchema.statics.getMonthlySpending = async function(userId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return await this.aggregate([
    { $match: {
        user: new mongoose.Types.ObjectId(userId),
        transactionDate: { $gte: sixMonthsAgo },
        type: { $in: ['debit','payment','withdrawal'] }
    }},
    { $group: {
        _id: { year: { $year: '$transactionDate' }, month: { $month: '$transactionDate' } },
        totalSpent: { $sum: '$amount' },
        count:      { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
};
        """, language="javascript")

    with tab3:
        st.code("""
transactionSchema.statics.getCategoryBreakdown = async function(userId) {
  return await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId),
                type: { $in: ['debit','payment','withdrawal'] } }},
    { $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count:       { $sum: 1 }
    }},
    { $sort: { totalAmount: -1 } }
  ]);
};
        """, language="javascript")

    st.divider()
    st.markdown("### 🔗 MongoDB Connection (from server.js)")
    st.code("""
// server.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
};

connectDB();
// MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/smartbankdb
    """, language="javascript")

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: SYLLABUS COVERAGE
# ══════════════════════════════════════════════════════════════════════════════
elif page == "📋 Syllabus Coverage":
    st.markdown("# 📋 Syllabus Coverage Report")
    st.success("✅ All 5 modules are fully implemented and working in SmartDigitalBankingSystem!")
    st.divider()

    modules = [
        {
            "module": "Module 1 — HTML, CSS & Bootstrap",
            "status": "✅ Complete",
            "items": [
                "DOCTYPE, semantic HTML5 tags, comments, headings, paragraphs",
                "Forms with inputs, labels, validation attributes",
                "Tables in transactions page",
                "Responsive Bootstrap 5 grid layout",
                "CSS Box Model, margins, padding, borders",
                "CSS text & font properties (Inter, Space Grotesk via Google Fonts)",
                "CSS colours, gradients, glassmorphism backgrounds",
                "Advanced selectors (pseudo-classes, combinators)",
                "🎬 Animated video background on LandingPage.js hero section",
                "Micro-animations: float, pulse-glow, fadeInUp, slide-in",
            ],
            "file": "frontend/src/pages/LandingPage.js + index.css"
        },
        {
            "module": "Module 2 — JavaScript (ES6+)",
            "status": "✅ Complete",
            "items": [
                "DOM manipulation (document.createElement, appendChild, innerHTML)",
                "Event handlers (onClick, onSubmit, onInput, onScroll)",
                "Email validation with regex in LoginPage & RegisterPage",
                "Toggle navigation (hamburger menu in Navbar)",
                "Arrays & functions with ES6 arrow functions, destructuring",
                "Async/await & Promises for API calls",
                "🌦 Weather App (open-meteo.com free API, no key needed)",
                "📱 QR Code Generator (qrserver.com API)",
                "📝 Rich Text Editor with localStorage save/load",
                "useCallback, useRef, useState hooks (ES6+ React patterns)",
            ],
            "file": "frontend/src/pages/ToolsPage.js"
        },
        {
            "module": "Module 3 — ReactJS",
            "status": "✅ Complete",
            "items": [
                "React component architecture (functional components)",
                "JSX syntax and Virtual DOM rendering",
                "useState, useEffect, useRef, useCallback, useContext hooks",
                "Controlled form components with validation",
                "HTTP calls via Axios (authService.js, transactionService.js)",
                "React Router v6 — simple & protected routing",
                "Context API (AuthContext) for state management",
                "Jest + React Testing Library (LoadingSpinner.test.js)",
                "Async test patterns, setup and teardown",
                "Component patterns: Layout wrapper, ProtectedRoute HOC",
            ],
            "file": "frontend/src/ (all files)"
        },
        {
            "module": "Module 4 — NoSQL (MongoDB)",
            "status": "✅ Complete",
            "items": [
                "MongoDB document-oriented database",
                "Mongoose ODM — Schema, Model, middleware",
                "Collections: users, transactions",
                "Connection via MONGO_URI in .env",
                "Cursors — find(), findOne(), sort(), skip(), limit()",
                "CRUD — Create, Read, Update, Delete on both collections",
                "Aggregation Pipeline — $match, $group, $sort, $avg, $sum",
                "getUserSummary(), getMonthlySpending(), getCategoryBreakdown()",
                "Indexes for query performance (user+createdAt, user+type)",
                "Mongoose sessions for atomic transactions",
            ],
            "file": "backend/models/Transaction.js + controllers/"
        },
        {
            "module": "Module 5 — Node.js & Express",
            "status": "✅ Complete",
            "items": [
                "Node.js event loop — async non-blocking architecture",
                "HTTP server built with Express.js",
                "MVC framework: Models / Controllers / Routes",
                "Middleware stack: helmet, cors, morgan, rate-limit, express-validator",
                "JWT authentication (authMiddleware.js)",
                "RESTful API routes: /api/auth, /api/transactions, /api/users",
                "Stream I/O — express.json body parsing",
                "Error handling middleware (errorMiddleware.js)",
                "Unit tests (Jest) for component reliability",
                "PostgreSQL-compatible patterns via Mongoose interface",
            ],
            "file": "backend/server.js + routes/ + controllers/"
        }
    ]

    for m in modules:
        with st.expander(f"{m['status']} {m['module']}", expanded=False):
            st.markdown(f"**File(s):** `{m['file']}`")
            for item in m["items"]:
                st.markdown(f"- {item}")

    st.divider()
    st.markdown("### 🚀 How to Run the Full Project")
    st.code("""
# Terminal 1 — Start MongoDB (if local)
mongod

# Terminal 2 — Start Backend (Node.js + Express)
cd backend
npm install
npm run dev        # runs on http://localhost:5000

# Terminal 3 — Start Frontend (React)
cd frontend
npm install
npm start          # runs on http://localhost:3000

# Terminal 4 — This Analytics Dashboard (Python)
cd SmartDigitalBankingSystem
streamlit run src/dashboard_rl.py --server.port 8501
    """, language="bash")
