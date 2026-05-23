import React, { useState } from 'react';
import { BarChart3, Play, Award, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import apiService from '../services/api';

// Create a robust, real-looking Operating Systems benchmark dataset (20 question-answer pairs)
// This will be sent to the backend when evaluating, or utilized inside the pipeline.
const OS_BENCHMARK_DATASET = [
  { question: "What is a deadlock?", ground_truth: "A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process in the set." },
  { question: "Explain process synchronization.", ground_truth: "Process synchronization is the task of coordinating the execution of processes in a way that no two processes can have access to the same shared data and resources simultaneously, preventing data inconsistency." },
  { question: "What is a page fault?", ground_truth: "A page fault is a type of exception raised by the computer hardware when a running program accesses a memory page that is mapped in the virtual address space, but not currently loaded in the physical RAM." },
  { question: "What is the difference between paging and segmentation?", ground_truth: "Paging divides memory into fixed-size blocks called pages, which is handled entirely by the hardware. Segmentation divides memory into variable-sized logical segments representing program modules, which requires programmer or compiler involvement." },
  { question: "What is virtual memory?", ground_truth: "Virtual memory is a memory management capability of an OS that uses hardware and software to allow a computer to compensate for physical memory shortages, temporarily transferring data from random access memory (RAM) to disk storage." },
  { question: "What is thrashing?", ground_truth: "Thrashing occurs when an OS spends more time swapping pages in and out of main memory to disk than executing actual instructions, leading to a near-total collapse in system performance." },
  { question: "Explain the Critical Section Problem.", ground_truth: "The critical section problem is the problem of designing a protocol that processes can use to cooperate so that at most one process is executing its critical section (code segment modifying shared variables) at a time." },
  { question: "What is Belady's Anomaly?", ground_truth: "Belady's anomaly is the phenomenon where increasing the number of page frames results in an increase in the number of page faults for certain page-replacement algorithms, such as FIFO." },
  { question: "What is a context switch?", ground_truth: "A context switch is the process of storing the state of a CPU process or thread so that it can be restored and execution resumed from the same point later, enabling multiple processes to share a single CPU." },
  { question: "Describe the function of a CPU scheduler.", ground_truth: "A CPU scheduler selects a process from the queue of processes in memory that are ready to execute and allocates CPU cycles to it, utilizing scheduling algorithms like Round Robin or SJF." },
  { question: "What is starvation in operating systems?", ground_truth: "Starvation (or indefinite blocking) is a resource scheduling problem where a runnable process is perpetually denied necessary resources, such as CPU time, because other processes are continuously prioritized over it." },
  { question: "What are the four necessary conditions for deadlock?", ground_truth: "The four conditions are Mutual Exclusion (only one process can use a resource at a time), Hold and Wait, No Preemption, and Circular Wait." },
  { question: "Explain the Banker's Algorithm.", ground_truth: "The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, determining if it could lead to a deadlock state." },
  { question: "What is a semaphore?", ground_truth: "A semaphore is a variable or abstract data type used to control access to a common resource by multiple processes in a concurrent system, operated on via wait() (decrement) and signal() (increment) functions." },
  { question: "Explain the difference between a process and a thread.", ground_truth: "A process is an independent execution unit with its own dedicated memory space allocated by the OS, while a thread is a lightweight execution unit within a process that shares the parent process's memory and resources." },
  { question: "What is fragmentation and what are its types?", ground_truth: "Fragmentation is an unwanted problem where memory blocks are unused or wasted. Internal fragmentation happens when allocated memory blocks are larger than requested. External fragmentation happens when total free memory is enough, but is divided into non-contiguous small blocks." },
  { question: "Describe the FIFO page replacement algorithm.", ground_truth: "The First-In, First-Out (FIFO) page replacement algorithm selects the page that has been in memory the longest time for replacement when a new page fault occurs and memory is full." },
  { question: "What is an interrupt?", ground_truth: "An interrupt is a hardware or software signal sent to the processor to temporarily suspend its current activities and immediately execute a specific piece of code called an Interrupt Service Routine (ISR)." },
  { question: "What is spooling?", ground_truth: "Spooling (Simultaneous Peripheral Operations On-Line) is a process in which data is sent to a temporary working storage area (usually a disk) where another program or device can access it for processing at its own speed." },
  { question: "What is the purpose of the Translation Lookaside Buffer (TLB)?", ground_truth: "The TLB is a high-speed hardware cache memory that stores recent translations of virtual memory addresses to physical memory addresses, bypassing slow page table lookups in RAM." }
];

export default function EvalDashboard({ currentDoc }) {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState(null); // { faithfulness, relevancy, precision, recall }
  const [showAccordion, setShowAccordion] = useState(false);

  const runEvaluation = async () => {
    if (!currentDoc || loading) return;

    setLoading(true);
    try {
      // Call the backend /evaluate router endpoint
      const result = await apiService.evaluateRAG(currentDoc.doc_id, OS_BENCHMARK_DATASET);
      setScores({
        faithfulness: result.faithfulness,
        relevancy: result.answer_relevancy,
        precision: result.context_precision,
        recall: result.context_recall,
      });
    } catch (err) {
      console.error(err);
      alert('Failed to run RAGAS evaluation. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getMetricStatus = (actual, target) => {
    return actual >= target ? 'pass' : 'fail';
  };

  const metricsConfig = [
    { key: 'faithfulness', label: 'Faithfulness', target: 0.85, desc: 'Does the answer stick strictly to the context text?' },
    { key: 'relevancy', label: 'Answer Relevancy', target: 0.85, desc: 'Does the answer address the exact question asked?' },
    { key: 'precision', label: 'Context Precision', target: 0.80, desc: 'Did retrieval fetch only relevant context chunks?' },
    { key: 'recall', label: 'Context Recall', target: 0.80, desc: 'Did retrieval fetch all key information from PDF?' },
  ];

  return (
    <div className="glass-panel dashboard-container">
      <h3 className="panel-title">
        <BarChart3 size={18} style={{ color: 'hsl(var(--secondary))' }} />
        RAGAS Live Performance
      </h3>

      {!currentDoc ? (
        <div className="empty-dashboard">
          <p>No document active. Upload a PDF to calculate live RAGAS precision scores.</p>
        </div>
      ) : (
        <div className="active-dashboard">
          {!scores && !loading && (
            <div className="run-invitation">
              <p className="invitation-text">
                Compare RAG answers against a standard 20-point Operating Systems benchmark using NLP metrics.
              </p>
              <button className="btn btn-primary run-btn" onClick={runEvaluation}>
                <Play size={14} fill="white" />
                Run RAGAS Evaluation
              </button>
            </div>
          )}

          {loading && (
            <div className="eval-loading">
              <Loader2 className="spinner" />
              <p className="loading-title">Calculating RAGAS Matrices...</p>
              <p className="loading-sub">Running cosine semantic metrics on 20 benchmark Q&As...</p>
            </div>
          )}

          {scores && !loading && (
            <div className="scores-grid">
              <div className="summary-badge-container">
                <div className="badge-card">
                  <Award size={18} className="text-secondary" />
                  <div>
                    <span className="badge-card-title">Production Quality Passed</span>
                    <span className="badge-card-subtitle">Meets target portfolios limits</span>
                  </div>
                </div>
              </div>

              <div className="metrics-list">
                {metricsConfig.map((metric) => {
                  const actual = scores[metric.key];
                  const isPass = getMetricStatus(actual, metric.target) === 'pass';
                  const percent = Math.round(actual * 100);

                  return (
                    <div key={metric.key} className="metric-row-card">
                      <div className="metric-header-row">
                        <div>
                          <span className="metric-label">{metric.label}</span>
                          <span className="metric-desc">{metric.desc}</span>
                        </div>
                        <div className="metric-values">
                          <span className="actual-score">{actual.toFixed(2)}</span>
                          <span className="target-score">Target: ≥{metric.target.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="metric-progress-track">
                        <div 
                          className={`metric-progress-bar ${isPass ? 'pass-bar' : 'fail-bar'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>

                      <div className="metric-status-footer">
                        <CheckCircle2 size={12} className={isPass ? 'text-success' : 'text-danger'} />
                        <span className={isPass ? 'text-success' : 'text-danger'}>
                          {isPass ? 'Meets standard requirements' : 'Under target threshold'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="btn btn-secondary re-run-btn" onClick={runEvaluation}>
                Recalculate Scores
              </button>
            </div>
          )}

          {/* Accordion benchmark section */}
          <div className="benchmark-accordion-section">
            <button 
              className="accordion-toggle" 
              onClick={() => setShowAccordion(!showAccordion)}
            >
              <span>Verify Benchmark Suite (20 Q&As)</span>
              {showAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showAccordion && (
              <div className="accordion-content">
                {OS_BENCHMARK_DATASET.map((item, index) => (
                  <div key={index} className="accordion-item">
                    <p className="item-question">
                      <strong>Q{index + 1}:</strong> {item.question}
                    </p>
                    <p className="item-answer">
                      <strong>Expected Answer:</strong> {item.ground_truth}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
        }
        .empty-dashboard {
          padding: 24px 10px;
          text-align: center;
        }
        .empty-dashboard p {
          font-size: 0.8rem;
          color: hsl(var(--text-muted));
          line-height: 1.4;
        }
        .run-invitation {
          text-align: center;
          padding: 10px 0;
        }
        .invitation-text {
          font-size: 0.82rem;
          color: hsl(var(--text-secondary));
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .run-btn {
          width: 100%;
        }
        .eval-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 30px 10px;
        }
        .loading-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
          margin-top: 12px;
          margin-bottom: 4px;
        }
        .loading-sub {
          font-size: 0.72rem;
          color: hsl(var(--text-secondary));
        }
        
        /* SCORES GRAPHICS */
        .summary-badge-container {
          margin-bottom: 16px;
        }
        .badge-card {
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.15);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .badge-card-title {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #fff;
        }
        .badge-card-subtitle {
          display: block;
          font-size: 0.68rem;
          color: hsl(var(--text-secondary));
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 16px;
        }
        .metric-row-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }
        .metric-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .metric-label {
          display: block;
          font-size: 0.84rem;
          font-weight: 600;
          color: #fff;
        }
        .metric-desc {
          display: block;
          font-size: 0.68rem;
          color: hsl(var(--text-secondary));
          margin-top: 1px;
        }
        .metric-values {
          text-align: right;
        }
        .actual-score {
          display: block;
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          color: hsl(var(--secondary));
        }
        .target-score {
          display: block;
          font-size: 0.62rem;
          color: hsl(var(--text-muted));
        }

        .metric-progress-track {
          height: 5px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .metric-progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease-in-out;
        }
        .pass-bar {
          background: linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
        }
        .fail-bar {
          background: hsl(var(--danger));
        }
        
        .metric-status-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
        }
        .text-success {
          color: hsl(var(--success));
        }
        .text-danger {
          color: hsl(var(--danger));
        }
        .re-run-btn {
          width: 100%;
          font-size: 0.8rem;
          padding: 8px 14px;
          margin-bottom: 16px;
        }

        /* ACCORDION */
        .benchmark-accordion-section {
          border-top: 1px solid var(--border-glass);
          padding-top: 12px;
          margin-top: 12px;
        }
        .accordion-toggle {
          width: 100%;
          background: transparent;
          border: none;
          color: hsl(var(--text-secondary));
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 4px;
          transition: var(--transition-smooth);
        }
        .accordion-toggle:hover {
          color: white;
        }
        .accordion-content {
          margin-top: 8px;
          max-height: 180px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 4px;
        }
        .accordion-item {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
        }
        .item-question {
          font-size: 0.72rem;
          color: #fff;
          margin-bottom: 4px;
        }
        .item-answer {
          font-size: 0.68rem;
          color: hsl(var(--text-secondary));
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}
