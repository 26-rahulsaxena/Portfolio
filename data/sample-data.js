// A copy of your real Google Sheet, so the Claude preview (which cannot read Google) shows your own content.
// Used only when USE_LOCAL_SAMPLE is true in js/config.js. The live site reads the sheet itself.
window.SAMPLE_DATA = {
 "Research": [
  {
   "Company": "Example Company Ltd",
   "Sector": "Industrials",
   "Title": "Example Company: DCF Valuation",
   "Date": "2026-10-01",
   "Summary": "Key finding in one or two lines.",
   "Key Result": "Main conclusion in one line.",
   "Key Risks": "Main risks to the thesis.",
   "Lessons Learned": "What you learned or would do differently.",
   "Target Price": "1,200.00",
   "CMP": "1,000.00",
   "Upside": "20.0%",
   "Recommendation": "Buy",
   "Valuation Method": "FCFF DCF",
   "Report Link": "https://drive.google.com/...",
   "Model Link": "https://drive.google.com/...",
   "Show": "No",
   "Featured": "No",
   "Rank": ""
  }
 ],
 "Projects": [
  {
   "Title": "Talent Auction: Human vs AI",
   "Category": "Other",
   "Date": "2026-10-09",
   "Summary": "A live hiring auction game for HR and managers. Players bid for candidates on a ₹2 crore budget against the AI, watch two AIs play each other, or face another manager online.",
   "Key Result": "Playable live web game with three modes (vs the AI, AI vs AI, and online against another manager), published and shareable from GitHub Pages.",
   "Lessons Learned": "Constraints make a simulation feel real: a ₹2 crore budget, one star per team, and humans and AI bidding on the same candidates. Changing the budget meant rescaling every cost and bid in the dataset so the numbers stayed consistent.",
   "Tools Used": "GitHub, Claude Code",
   "Link": "https://26-rahulsaxena.github.io/Talent-auctionn/",
   "Tags": "Game; Hiring; AI",
   "Show": "Yes",
   "Featured": "Yes",
   "Rank": ""
  },
  {
   "Title": "Polycab India: Interactive Financial Dashboard",
   "Category": "Dashboard",
   "Date": "2026-10-16",
   "Summary": "An interactive dashboard on Polycab, a listed Indian wire and cable company, covering five years of financials, ratios, KPIs and share price.",
   "Key Result": "A live dashboard that puts five years of Polycab's financials, ratios, KPIs and share price in one place instead of scattered spreadsheets and PDFs.",
   "Lessons Learned": "Building in stages (data extraction first, then the dashboard) kept it manageable. Structured data exports were the main source, with annual reports and investor presentations used only to verify numbers and fill gaps.",
   "Tools Used": "GitHub, Claude Code",
   "Link": "https://polycabdashboard.streamlit.app/",
   "Tags": "Polycab; Dashboard; Financials",
   "Show": "Yes",
   "Featured": "Yes",
   "Rank": ""
  }
 ],
 "Articles": [
  {
   "Title": "Jio: India's Biggest IPO & The Financial Details You Shouldn't Ignore",
   "Date": "2026-10-26",
   "Topic": "IPO",
   "Summary": "Jio is a strong business with 524M customers, but the ₹10.3 lakh crore IPO valuation assumes much of the growth is already priced in. Flags spectrum dues outside reported net debt, low cash taxes expected to rise, and the ARPU growth still needed.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/jio-indias-biggest-ipo-and-the-financial",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "Before You Buy Your Next Stock, \"Read This First\"",
   "Date": "2026-07-23",
   "Topic": "Investing basics",
   "Summary": "Skip the stock tips and start with Warren Buffett's free Berkshire Hathaway shareholder letters.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/before-you-buy-your-next-stock-read",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "Markets Are Moving — But Conviction Isn't",
   "Date": "2026-01-24",
   "Topic": "Markets",
   "Summary": "Weekly Market Wrap #7. Indian markets declined with no clear trend, weakness spread beyond large caps, fewer stocks took part, and investors focused on protecting capital.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/markets-are-moving-but-conviction",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "Market Is Moving Nowhere; But Here's What Investor Can Do In This Bear Market!",
   "Date": "2026-01-17",
   "Topic": "Markets",
   "Summary": "Weekly Market Wrap #6. A sideways market is a \"time correction\" where earnings catch up to valuations. Prepare, cut weak positions and stay patient.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/market-is-moving-nowhere-but-here",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "Why Most Investors Lose Money In Stock Market?",
   "Date": "2026-01-04",
   "Topic": "Investor behaviour",
   "Summary": "Weekly Market Wrap #5. Losses come from repeated poor decisions. Five recurring errors, each with a practical check.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/why-most-investors-lose-money-in",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "How to Understand Any Company in Minutes? - Using Practical AI Prompt",
   "Date": "2025-12-27",
   "Topic": "Research process",
   "Summary": "Weekly Market Wrap #4. Investors lose money when they don't understand the business. Two AI prompts turn company documents or public sources into a plain-English breakdown.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/how-to-understand-any-company-in",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "How To Find Strong Leaders in a Weak Market? - Part 2",
   "Date": "2025-12-20",
   "Topic": "Markets",
   "Summary": "Weekly Market Wrap #3. Favour stocks that hold strength in weak markets and trade near yearly highs. Screen for stocks above key moving averages.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/how-to-find-strong-leaders-in-a-weak",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "How To Find Strong Stocks In a Weak Market?",
   "Date": "2025-12-14",
   "Topic": "Markets",
   "Summary": "Weekly Market Wrap #2. Start with sectors with real demand, check order books, verify execution, then confirm price resilience.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/how-to-find-strong-stocks-in-a-week",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "Market Moves- Weak Breadth, Strong Time",
   "Date": "2025-12-08",
   "Topic": "Markets",
   "Summary": "Weekly Market Wrap #1. With the Nifty 50 near its high, few stocks are rising and most sit below key moving averages. Be selective.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/market-moves-weak-breadth-strong",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "Lenskart Solutions Limited: Why it seems a dumb investment?",
   "Date": "2025-11-03",
   "Topic": "IPO",
   "Summary": "IPO note. Risky at a very high valuation: thin adjusted profits, much of the proceeds going to existing shareholders, and asset-heavy store leases.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/lenskart-solutions-limited-why-it",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "Is the AI Boom Really a \"Bubble\" or a \"Multi-Billion Dollar Opportunity\"?",
   "Date": "2025-10-07",
   "Topic": "Technology",
   "Summary": "AI spending has real speculation and valuations ahead of unclear revenue, yet the technology is substantive. Some valuations may crash while lasting infrastructure and strong firms shape the next economy.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/is-the-ai-boom-really-a-bubble-or",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  },
  {
   "Title": "KROSS- A Proxy to Transport & Logisitcs Expansion",
   "Date": "2025-10-05",
   "Topic": "Company note",
   "Summary": "Kross, an Indian trailer axle and forged parts maker, could be a proxy for transport growth, with low debt and OEM ties, despite execution and cyclicality risks.",
   "Platform": "Substack",
   "Link": "https://rahulsaxena1104.substack.com/p/kross-a-proxy-to-transport-and-logisitcs",
   "Show": "Yes",
   "Featured": "No",
   "Rank": ""
  }
 ],
 "Certificates": [
  {
   "Title": "Example Certificate Name",
   "Issuer": "Issuing Organisation",
   "Date Issued": "2026-06-01",
   "Type": "Course",
   "Summary": "What it covered.",
   "Image Link": "https://drive.google.com/...",
   "Verification Link": "https://...",
   "Show": "No",
   "Featured": "No",
   "Rank": ""
  }
 ],
 "Experience": [
  {
   "Role": "Example Role",
   "Organization": "Example Organisation",
   "Location": "Delhi",
   "Start Date": "2026-01-01",
   "End Date": "2026-03-31",
   "Type": "Internship",
   "Description": "Main tasks and results. Separate points with a semicolon (;).",
   "Certificate Link": "https://...",
   "Show": "No",
   "Order": "1"
  }
 ],
 "Skills": [
  {
   "Skill": "Excel",
   "Category": "Tools",
   "Level": "Advanced",
   "Show": "No",
   "Order": "1"
  }
 ],
 "Testimonials": [
  {
   "Quote": "A one or two line recommendation, in their words.",
   "Name": "Example Name",
   "Role / Relationship": "Professor",
   "Organization": "Example Institute",
   "Link": "https://...",
   "Show": "No",
   "Order": "1"
  }
 ],
 "Gallery": [
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/1geVIir9fXEgR11q_oZbK2dkamEvFeRE7/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/1j7_m8JBScmXWtyOYHkusXVi3y0jSvOgt/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/1l418Yji_mSihwLocHb-p9H7B-rzLvBzM/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/1QS_jGcN87OTP1dzPFfbZB2EQ_McE72Uz/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/103u75V-ICU16lSvx-b7swNt_OBvOXC6N/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/1X3kFRfTUIMe1b60bRgCYfcMDdYgdewD8/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/13b4LZTyAbn_JtWQXcYt7V1KltRQnTyFV/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/10woVIJg4yT9NLe3ey9ltglpbabILu98K/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/1ZgeWyn5a9hKuXs75sGxl_PvgmiOUu_Il/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  },
  {
   "Title": "Talent Auction",
   "Event": "AI Business Workshop",
   "Date": "2026-10-09",
   "Type": "Photo",
   "Media Link": "https://drive.google.com/file/d/15qiBUAkYUZ2j9pnFNg-MQ7uLDIeOvz7x/view?usp=sharing",
   "Thumbnail Link": "",
   "Caption": "",
   "Show": "Yes"
  }
 ],
 "About": [
  {
   "Field": "Name",
   "Value": "Rahul Saxena"
  },
  {
   "Field": "Headline",
   "Value": "PGDM (Finance) · Equity research, financial modelling and valuation"
  },
  {
   "Field": "Positioning Statement",
   "Value": "I turn company financials into clear, evidence-backed investment views."
  },
  {
   "Field": "Bio",
   "Value": "PGDM (Finance) candidate with hands-on work in equity research, financial modelling and valuation. I write about markets and companies on Substack and LinkedIn."
  },
  {
   "Field": "Email",
   "Value": "rahulsaxena.1104@gmail.com"
  },
  {
   "Field": "LinkedIn",
   "Value": "https://www.linkedin.com/in/rahulsaxena1104"
  },
  {
   "Field": "Newsletter Link",
   "Value": "https://rahulsaxena1104.substack.com/"
  },
  {
   "Field": "Location",
   "Value": "New Delhi"
  },
  {
   "Field": "Resume Link",
   "Value": "https://drive.google.com/file/d/1sKOj-PkXQR3wgKnfvK-EhBAMQkO3UGtw/view"
  },
  {
   "Field": "Open To",
   "Value": "Equity Research · Financial Analyst roles"
  },
  {
   "Field": "Availability",
   "Value": "Immediate"
  },
  {
   "Field": "Current Focus",
   "Value": "Pursuing my PGDM (Finance) at Fortune Institute of International Business while building equity research reports and valuation models, and writing the weekly BIZaar market newsletter on Substack."
  },
  {
   "Field": "Stat 1",
   "Value": "12,000+ | Combined following"
  },
  {
   "Field": "Stat 2",
   "Value": "3M+ | Impressions at peak"
  },
  {
   "Field": "Stat 3",
   "Value": "100+ | Posts published"
  },
  {
   "Field": "Hero Line 1",
   "Value": "Student of the market."
  },
  {
   "Field": "Hero Line 2",
   "Value": "Always in session."
  },
  {
   "Field": "Hero Subline",
   "Value": "Finance student · Equity research · New Delhi"
  }
 ]
};
