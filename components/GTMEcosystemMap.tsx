'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Layers, 
  Cpu, 
  Database, 
  Zap, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  Filter, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Server, 
  GitBranch, 
  AlertTriangle,
  Search,
  Maximize2
} from 'lucide-react';

export interface EcosystemNode {
  id: string;
  name: string;
  category: 'CRM' | 'MAP' | 'Enrichment' | 'Billing' | 'Warehouse' | 'ReverseETL' | 'Analytics' | 'CS' | 'Middleware' | 'Ops';
  domain: 'Sales' | 'Marketing' | 'Customer Success' | 'Finance' | 'Core Infrastructure';
  protocol: string;
  throughput: string;
  responsibilities: string[];
  failureModes: string[];
  governorLimits: string[];
  mitigations: string[];
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export interface EcosystemLink {
  source: string;
  target: string;
  label: string;
  protocol: 'Webhook' | 'REST API' | 'Reverse ETL' | 'Batch ETL' | 'Event Stream' | 'Queue Worker';
  latency: string;
  direction: 'unidirectional' | 'bidirectional';
}

const INITIAL_NODES: EcosystemNode[] = [
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    category: 'CRM',
    domain: 'Sales',
    protocol: 'REST / Bulk API 2.0 / Streaming API',
    throughput: 'Up to 100k API calls/day (Org limit)',
    responsibilities: [
      'Single source of truth for Opportunities, Accounts, and Contacts',
      'Lead routing and territory ownership assignment rules',
      'CPQ pricing approvals and pipeline forecasting stages'
    ],
    failureModes: [
      'SOQL 101 Too Many Queries in Trigger execution',
      'Row Lock Contention (UNABLE_TO_LOCK_ROW) during concurrent writes',
      'Daily 24-hour API call limit exhaustion'
    ],
    governorLimits: [
      '100 synchronous SOQL queries per transaction',
      '150 DML statements per Apex transaction',
      '25 concurrent long-running API requests (>5s)'
    ],
    mitigations: [
      'Bulkify all Apex triggers and decouple writes via Platform Events',
      'Use asynchronous Queueable/Batch Apex for heavy record updates',
      'Implement external Redis lock keys to serialize conflicting writes'
    ],
    x: 480,
    y: 280
  },
  {
    id: 'hubspot',
    name: 'HubSpot MAP',
    category: 'MAP',
    domain: 'Marketing',
    protocol: 'REST API v3 & Webhooks',
    throughput: '100 req / 10 sec burst (standard tier)',
    responsibilities: [
      'Inbound marketing landing page form ingestion',
      'Email nurture sequence workflows and unsubscribe preference sync',
      'First-touch and multi-touch campaign attribution tracking'
    ],
    failureModes: [
      'HTTP 429 Rate Limit burst during marketing webinars',
      'Bi-directional sync loop with Salesforce creating duplicate leads',
      'Schema drift when marketing creates custom properties without API mapping'
    ],
    governorLimits: [
      '100 requests per 10-second rolling window per token',
      'Search API limit of 4 requests/sec',
      'Maximum 10 concurrent requests per app'
    ],
    mitigations: [
      'Buffer inbound form submissions in AWS SQS with Leaky Bucket rate limiting',
      'Enforce sync-origin bot exclusion filters (`last_modified_by != sync_bot`)',
      'Automated nightly JSON schema validation tests'
    ],
    x: 240,
    y: 160
  },
  {
    id: 'clay',
    name: 'Clay & Apollo Waterfall',
    category: 'Enrichment',
    domain: 'Marketing',
    protocol: 'REST API & Webhooks',
    throughput: '20-50 req/sec across cascaded providers',
    responsibilities: [
      'Cascading waterfall email/phone lookup (Apollo -> Hunter -> ZoomInfo)',
      'Firmographic enrichment (Headcount, Tech Stack, Funding Series)',
      'Domain normalization and company duplicate pre-screening'
    ],
    failureModes: [
      'Excessive API credit burn from un-cached repetitive queries',
      'Slow response latency (3-6s per waterfall step) timing out ingress',
      'Stale employment data causing high email bounce rates'
    ],
    governorLimits: [
      'Provider-specific monthly credit caps ($0.02 - $0.50 per record)',
      'Provider HTTP timeout thresholds of 5000ms',
      'Rate limits: 300 req/min for Apollo, 60 req/min for ZoomInfo'
    ],
    mitigations: [
      'Check internal Postgres cache first before triggering paid external APIs',
      'Run enrichment fully asynchronously in background worker queues',
      'Hard credit budget caps and real-time Slack burn alerts'
    ],
    x: 220,
    y: 360
  },
  {
    id: 'stripe',
    name: 'Stripe Billing',
    category: 'Billing',
    domain: 'Finance',
    protocol: 'Signed Webhooks (`stripe-signature`)',
    throughput: 'Spike to 1,000+ webhook events/sec during billing cycles',
    responsibilities: [
      'Subscription lifecycle events (checkout.completed, invoice.paid)',
      'Failed payment dunning & churn risk signals to CS',
      'ARR and MRR contract value synchronization to CRM Opportunities'
    ],
    failureModes: [
      'Out-of-order webhook delivery causing subscription status race conditions',
      'Webhook replay storm duplicating revenue metrics',
      'Failed signature verification due to raw payload stream tampering'
    ],
    governorLimits: [
      'Webhook endpoints must respond 200 OK within 2000ms',
      'Stripe retry schedule up to 72 hours on 5xx responses',
      'Rate limit of 100 read/write operations/sec in test mode'
    ],
    mitigations: [
      'Verify `Stripe-Signature` using raw unparsed request body',
      'Store event ID in Redis with 24-hr TTL for atomic idempotency check',
      'Process event ordering using event timestamps rather than arrival time'
    ],
    x: 740,
    y: 180
  },
  {
    id: 'redis_queue',
    name: 'Redis / SQS Message Queue',
    category: 'Middleware',
    domain: 'Core Infrastructure',
    protocol: 'Redis Streams / AMQP / SQS',
    throughput: '10,000+ msg/sec buffer throughput',
    responsibilities: [
      'Shock absorber for ingress webhook spikes',
      'Decouples fast producers (200ms ACK) from slow SaaS consumers (1-3s API)',
      'Dead-Letter Queue (DLQ) storage for poison-pill payloads'
    ],
    failureModes: [
      'Redis OOM (Out of Memory) if consumer worker pool crashes',
      'Message visibility timeout expiry causing double processing',
      'Dead-Letter Queue accumulation without alerting'
    ],
    governorLimits: [
      'SQS 256KB max payload size (use S3 pointer for large payloads)',
      'Redis memory maxmemory eviction policy constraints',
      'Max 14 days message retention in SQS'
    ],
    mitigations: [
      'Autoscale Celery/Node worker containers based on SQS Queue Depth metric',
      'Store oversized payloads in S3 and pass presigned URI in queue message',
      'Prometheus / Datadog alert on DLQ message count > 0'
    ],
    x: 480,
    y: 140
  },
  {
    id: 'snowflake',
    name: 'Snowflake Data Warehouse',
    category: 'Warehouse',
    domain: 'Core Infrastructure',
    protocol: 'SQL / Fivetran Connector / dbt',
    throughput: 'Petabyte scale historical analytics storage',
    responsibilities: [
      'Unified single source of truth across product usage, CRM, and billing',
      'dbt transformation models for Multi-Touch Attribution and Customer 360',
      'Product-Led Growth (PQL) score modeling and feature usage aggregations'
    ],
    failureModes: [
      'Stale data models due to failed dbt scheduled runs',
      'High compute warehouse credit spend from unoptimized join queries',
      'Schema evolution breaking downstream Reverse ETL tables'
    ],
    governorLimits: [
      'Auto-suspend warehouse after 1 minute of inactivity',
      'Query execution timeout thresholds',
      'Concurrent query limits per warehouse cluster'
    ],
    mitigations: [
      'Implement dbt test suites (unique, not_null, accepted_values)',
      'Warehouse credit alerts and automated cluster auto-scaling',
      'Contract-based data model schemas for Reverse ETL queries'
    ],
    x: 760,
    y: 400
  },
  {
    id: 'census',
    name: 'Census / Hightouch Reverse ETL',
    category: 'ReverseETL',
    domain: 'Core Infrastructure',
    protocol: 'SQL to SaaS REST Batch Upserts',
    throughput: 'Sync 50k+ records every 15 minutes',
    responsibilities: [
      'Sync calculated PQL scores from Snowflake into Salesforce Lead & Contact',
      'Sync aggregated usage metrics to Gainsight Customer Success',
      'Keep marketing audiences in HubSpot synced with real-time product tiers'
    ],
    failureModes: [
      'Overwriting human sales rep manual field edits with stale warehouse data',
      'Hitting Salesforce 24-hour API limit during full-table re-sync',
      'Field mapping type mismatches (e.g. String vs Number dropdown)'
    ],
    governorLimits: [
      'Downstream SaaS API rate limits',
      'Sync schedule intervals (15m, 1hr, 24hr)',
      'Batch size configuration (e.g. 200 records per Salesforce batch)'
    ],
    mitigations: [
      'Use primary key diffing so only modified records trigger API updates',
      'Field-level write permissions: configure "Only update if empty"',
      'Schedule heavy syncs during off-peak hours (midnight UTC)'
    ],
    x: 520,
    y: 430
  },
  {
    id: 'segment',
    name: 'Segment / PostHog Analytics',
    category: 'Analytics',
    domain: 'Marketing',
    protocol: 'Event Stream Webhooks / Client SDK',
    throughput: 'Millions of client-side events/day',
    responsibilities: [
      'Ingest real-time product signup, workspace creation, and invite events',
      'Route identity events (`identify`, `track`, `group`) to downstream SaaS',
      'Trigger real-time Slack notifications for high-value enterprise signups'
    ],
    failureModes: [
      'Client-side ad blockers dropping 15-25% of analytics events',
      'Unstructured tracking event names causing data pollution',
      'Downstream webhook destinations failing and dropping event history'
    ],
    governorLimits: [
      'Monthly Tracked Users (MTU) billing tiers',
      'Event payload size limits (32KB max)',
      'Source-to-Destination delivery latency < 500ms'
    ],
    mitigations: [
      'Use server-side event tracking for all mission-critical billing/signup events',
      'Enforce Segment Protocols tracking plan to reject non-conforming events',
      'Replay failed destination payloads via Segment sync retry archive'
    ],
    x: 230,
    y: 20
  },
  {
    id: 'gainsight',
    name: 'Gainsight CS Platform',
    category: 'CS',
    domain: 'Customer Success',
    protocol: 'REST API & Bi-Directional Salesforce Sync',
    throughput: 'Near real-time account health scoring',
    responsibilities: [
      'Calculate Customer Health Scores from product usage + support tickets',
      'Automated Call-To-Action (CTA) playbooks for churn risk accounts',
      'Renewal opportunity tracking and executive sponsor change alerts'
    ],
    failureModes: [
      'Stale usage data leading to false-positive healthy ratings on churning logos',
      'Conflicting account owner assignments between Salesforce and Gainsight',
      'API sync latency delaying critical onboarding milestone alerts'
    ],
    governorLimits: [
      'Gainsight API call rate limits (50 calls/min)',
      'Salesforce custom object storage limits',
      'Batch sync frequency windows'
    ],
    mitigations: [
      'Direct Snowflake data source connection for daily usage metrics',
      'Designate Salesforce as strict master for account ownership',
      'Automated health alert fallback via Slack integration'
    ],
    x: 800,
    y: 290
  }
];

const INITIAL_LINKS: EcosystemLink[] = [
  {
    source: 'segment',
    target: 'redis_queue',
    label: 'High-Frequency Webhooks',
    protocol: 'Event Stream',
    latency: '< 50ms',
    direction: 'unidirectional'
  },
  {
    source: 'hubspot',
    target: 'redis_queue',
    label: 'Inbound Form Submissions',
    protocol: 'Webhook',
    latency: '< 150ms',
    direction: 'unidirectional'
  },
  {
    source: 'stripe',
    target: 'redis_queue',
    label: 'Signed Invoices & Subscriptions',
    protocol: 'Webhook',
    latency: '< 200ms',
    direction: 'unidirectional'
  },
  {
    source: 'redis_queue',
    target: 'clay',
    label: 'Async Waterfall Enrichment',
    protocol: 'Queue Worker',
    latency: '1-3s',
    direction: 'unidirectional'
  },
  {
    source: 'clay',
    target: 'salesforce',
    label: 'Bulkified Enriched Leads',
    protocol: 'REST API',
    latency: '< 500ms',
    direction: 'unidirectional'
  },
  {
    source: 'redis_queue',
    target: 'salesforce',
    label: 'Idempotent Batch Upsert',
    protocol: 'Queue Worker',
    latency: '< 400ms',
    direction: 'unidirectional'
  },
  {
    source: 'salesforce',
    target: 'snowflake',
    label: 'Nightly Fivetran ETL',
    protocol: 'Batch ETL',
    latency: '15-60m',
    direction: 'unidirectional'
  },
  {
    source: 'stripe',
    target: 'snowflake',
    label: 'Fivetran Revenue Extract',
    protocol: 'Batch ETL',
    latency: '1hr',
    direction: 'unidirectional'
  },
  {
    source: 'snowflake',
    target: 'census',
    label: 'dbt PQL Score Models',
    protocol: 'Reverse ETL',
    latency: 'Scheduled 15m',
    direction: 'unidirectional'
  },
  {
    source: 'census',
    target: 'salesforce',
    label: 'PQL Scores & Usage Metrics',
    protocol: 'Reverse ETL',
    latency: '< 2s batch',
    direction: 'unidirectional'
  },
  {
    source: 'census',
    target: 'hubspot',
    label: 'Dynamic Lifecycle Audiences',
    protocol: 'Reverse ETL',
    latency: '< 3s batch',
    direction: 'unidirectional'
  },
  {
    source: 'salesforce',
    target: 'gainsight',
    label: 'Bi-Directional Account Sync',
    protocol: 'REST API',
    latency: '< 5s',
    direction: 'bidirectional'
  },
  {
    source: 'census',
    target: 'gainsight',
    label: 'Snowflake Health Metrics',
    protocol: 'Reverse ETL',
    latency: '15m',
    direction: 'unidirectional'
  }
];

export const GTMEcosystemMap: React.FC = () => {
  const [nodes, setNodes] = useState<EcosystemNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<EcosystemNode | null>(INITIAL_NODES[0]);
  const [hoveredNode, setHoveredNode] = useState<EcosystemNode | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Filter nodes based on domain and search
  const filteredNodes = nodes.filter((n) => {
    const domainMatch = domainFilter === 'all' || n.domain === domainFilter;
    const searchMatch = !searchQuery || 
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.responsibilities.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return domainMatch && searchMatch;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredLinks = INITIAL_LINKS.filter(
    (l) => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
  );

  // Dragging handlers
  const handleMouseDown = (nodeId: string) => {
    setIsDragging(true);
    setDraggedNodeId(nodeId);
    const found = nodes.find((n) => n.id === nodeId);
    if (found) setSelectedNode(found);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !draggedNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(50, Math.min(950, ((e.clientX - rect.left) / rect.width) * 1000));
    const y = Math.max(50, Math.min(500, ((e.clientY - rect.top) / rect.height) * 550));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggedNodeId ? { ...n, x, y } : n))
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  const getNodeColor = (category: EcosystemNode['category']) => {
    switch (category) {
      case 'CRM': return { bg: '#4f46e5', ring: '#818cf8', light: '#eef2ff', text: '#3730a3' };
      case 'MAP': return { bg: '#ea580c', ring: '#fb923c', light: '#fff7ed', text: '#9a3412' };
      case 'Enrichment': return { bg: '#0284c7', ring: '#38bdf8', light: '#f0f9ff', text: '#075985' };
      case 'Billing': return { bg: '#16a34a', ring: '#4ade80', light: '#f0fdf4', text: '#166534' };
      case 'Warehouse': return { bg: '#0891b2', ring: '#22d3ee', light: '#ecfeff', text: '#155e75' };
      case 'ReverseETL': return { bg: '#9333ea', ring: '#c084fc', light: '#faf5ff', text: '#6b21a8' };
      case 'Analytics': return { bg: '#db2777', ring: '#f472b6', light: '#fdf2f8', text: '#9d174d' };
      case 'CS': return { bg: '#d97706', ring: '#fbbf24', light: '#fffbeb', text: '#92400e' };
      case 'Middleware': return { bg: '#dc2626', ring: '#f87171', light: '#fef2f2', text: '#991b1b' };
      default: return { bg: '#57534e', ring: '#a8a29e', light: '#f5f5f4', text: '#292524' };
    }
  };

  const activeNode = selectedNode || hoveredNode || nodes[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold shadow-xs shrink-0">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                  <GitBranch className="h-3.5 w-3.5 text-indigo-600" />
                  Interactive GTM Ecosystem &amp; Data Pipeline Architecture
                </span>
                <span className="text-xs text-stone-500 hidden sm:inline">
                  Interactive Node-Link Map
                </span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                GTM System Relationships, Protocols &amp; Failure Modes
              </h2>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search systems or protocols..."
                className="rounded-xl border border-stone-200 bg-stone-50 pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none w-44 sm:w-56"
              />
            </div>

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              aria-label="Filter by Domain"
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Domains (Sales, Mktg, CS, Data)</option>
              <option value="Sales">Sales Systems (CRM, Routing)</option>
              <option value="Marketing">Marketing Systems (MAP, Enrichment)</option>
              <option value="Customer Success">Customer Success (Gainsight)</option>
              <option value="Finance">Finance &amp; Billing (Stripe)</option>
              <option value="Core Infrastructure">Core Data &amp; Queue Middleware</option>
            </select>

            <button
              onClick={() => setNodes(INITIAL_NODES)}
              title="Reset Layout Positions"
              className="p-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Interactive Canvas + Engineering Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Force Graph Canvas (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">Topology Canvas</span>
              <span className="text-stone-400">&bull;</span>
              <span className="text-stone-500">Drag nodes or click to inspect engineering rubrics</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Flow
              </span>
            </div>
          </div>

          {/* SVG Map */}
          <div className="relative w-full h-[460px] bg-[#fafaf9] rounded-xl border border-stone-200/80 overflow-hidden cursor-crosshair">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 550"
              className="w-full h-full select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid Background Pattern */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e7e5e4" strokeWidth="0.8" opacity="0.6" />
                </pattern>
                {/* Arrow markers */}
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#6366f1" />
                </marker>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Render Links */}
              {filteredLinks.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isConnectedToSelected = 
                  selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);

                return (
                  <g key={`${link.source}-${link.target}-${idx}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isConnectedToSelected ? '#6366f1' : '#cbd5e1'}
                      strokeWidth={isConnectedToSelected ? 2.5 : 1.5}
                      strokeDasharray={link.protocol === 'Reverse ETL' ? '4 4' : undefined}
                      markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
                      className="transition-colors duration-300"
                    />

                    {/* Midpoint protocol label pill */}
                    <g transform={`translate(${(sourceNode.x + targetNode.x) / 2}, ${(sourceNode.y + targetNode.y) / 2})`}>
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="18"
                        rx="5"
                        fill="#ffffff"
                        stroke={isConnectedToSelected ? '#818cf8' : '#e2e8f0'}
                        strokeWidth="1"
                        className="shadow-2xs"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        fontSize="8.5"
                        fontWeight="600"
                        fill={isConnectedToSelected ? '#4338ca' : '#64748b'}
                      >
                        {link.protocol} ({link.latency})
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const colors = getNodeColor(node.category);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform"
                    onMouseDown={() => handleMouseDown(node.id)}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Outer Glow Ring for Active/Hover */}
                    {(isSelected || isHovered) && (
                      <circle
                        r="34"
                        fill="none"
                        stroke={colors.ring}
                        strokeWidth="3"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                      />
                    )}

                    {/* Outer circle */}
                    <circle
                      r="26"
                      fill={isSelected ? colors.bg : '#ffffff'}
                      stroke={colors.bg}
                      strokeWidth="3"
                      className="shadow-md transition-all duration-200 hover:scale-110"
                    />

                    {/* Center Icon/Initials */}
                    <text
                      textAnchor="middle"
                      y="4"
                      fontSize="11"
                      fontWeight="800"
                      fill={isSelected ? '#ffffff' : colors.text}
                    >
                      {node.category.substring(0, 3)}
                    </text>

                    {/* Node Text Label underneath */}
                    <g transform="translate(0, 38)">
                      <rect
                        x={-node.name.length * 3.5 - 8}
                        y="-10"
                        width={node.name.length * 7 + 16}
                        height="20"
                        rx="6"
                        fill="#ffffff"
                        stroke={isSelected ? colors.bg : '#e2e8f0'}
                        strokeWidth={isSelected ? 1.5 : 1}
                        className="shadow-2xs"
                      />
                      <text
                        textAnchor="middle"
                        y="4"
                        fontSize="9.5"
                        fontWeight="700"
                        fill={isSelected ? colors.text : '#1e293b'}
                      >
                        {node.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-500">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-stone-700">Categories:</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> CRM</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-600" /> MAP</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Enrichment</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Billing</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-cyan-600" /> Warehouse</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Reverse ETL</span>
            </div>
            <span className="text-[10px] text-stone-400">Click node to inspect details &rarr;</span>
          </div>
        </div>

        {/* Right Column: Engineering Responsibilities & Failure Modes (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          {/* Header of Active Node */}
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-extrabold text-xs shadow-xs"
                style={{ backgroundColor: getNodeColor(activeNode.category).bg }}
              >
                {activeNode.category}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {activeNode.domain} Domain
                  </span>
                  <span className="rounded-md bg-stone-100 px-1.5 py-0.2 text-[10px] font-semibold text-stone-600 border border-stone-200">
                    {activeNode.protocol}
                  </span>
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {activeNode.name}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-stone-500 block">Est. Throughput</span>
              <span className="text-xs font-bold text-indigo-700">{activeNode.throughput.split('(')[0]}</span>
            </div>
          </div>

          {/* Section 1: Core Engineering Responsibilities */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              <span>Key GTM Engineering Responsibilities</span>
            </div>
            <ul className="space-y-1.5">
              {activeNode.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Failure Modes & Edge Cases */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span>High-Stakes Failure Modes &amp; Outage Risks</span>
            </div>
            <ul className="space-y-1.5">
              {activeNode.failureModes.map((fail, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-rose-950 bg-rose-50/70 p-2 rounded-lg border border-rose-200/70">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600 mt-0.5 shrink-0" />
                  <span>{fail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Governor Limits & Quotas */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Server className="h-3.5 w-3.5 text-amber-600" />
              <span>Governor Limits &amp; Quota Constraints</span>
            </div>
            <div className="rounded-xl bg-amber-50/60 p-2.5 border border-amber-200/70 text-xs text-amber-950 space-y-1">
              {activeNode.governorLimits.map((limit, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] font-medium">
                  <span className="text-amber-700 font-bold">&bull;</span>
                  <span>{limit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Staff-Level Architectural Mitigations */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Staff GTM Mitigation Checklist</span>
            </div>
            <div className="rounded-xl bg-emerald-50/70 p-2.5 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              {activeNode.mitigations.map((mit, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] font-semibold">
                  <span className="text-emerald-700 font-bold">&check;</span>
                  <span>{mit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
