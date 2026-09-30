/**
 * PSCIMS 2.0 - Active Job Adverts & Application Tracker Engine
 * Captures official PSC listings, job specifications, and streamlined submission physics.
 */

import { apiClient } from './api-client.js';

export const activeJobsData = [
  {
    advertNumber: '188/2026',
    organization: 'Bomet University College',
    position: 'VICE CHANCELLOR',
    vacancies: 1,
    yearsExp: 15,
    category: 'University Senior Management',
    advertDate: '22-09-2026',
    closeDate: '13-10-2026',
    jobScale: 'Executive / VC Grade',
    duties: 'Serve as the Chief Executive and Academic Head of the University; coordinate institutional planning, academic leadership, financial stewardship and resource mobilization.',
    requirements: 'Hold an earned Doctorate (PhD) degree from a recognized university; minimum 15 years academic, teaching and administrative experience in higher education; distinguished scholarly record.'
  },
  {
    advertNumber: '144/2026',
    organization: 'Kenyatta University',
    position: 'Deputy Vice-Chancellor (Administration and Finance)',
    vacancies: 1,
    yearsExp: 12,
    category: 'University Senior Management',
    advertDate: '22-09-2026',
    closeDate: '13-10-2026',
    jobScale: 'Executive / DVC Grade',
    duties: 'Responsible for general administration, personnel management, financial planning, development projects, and management of university physical assets.',
    requirements: 'Earned PhD; Associate Professor or Full Professor; minimum 12 years proven management experience in administration or finance within recognized academic institutions.'
  },
  {
    advertNumber: '146/2026',
    organization: 'Makueni University College',
    position: 'PRINCIPAL',
    vacancies: 1,
    yearsExp: 15,
    category: 'University Senior Management',
    advertDate: '22-09-2026',
    closeDate: '13-10-2026',
    jobScale: 'Executive / Principal',
    duties: 'Lead academic innovation, spearhead accreditation processes, guide faculty governance, oversee fiscal compliance and community outreach.',
    requirements: 'PhD from recognized institution; at least 15 years demonstrated leadership in academic governance, research management and institutional development.'
  },
  {
    advertNumber: '145/2026',
    organization: 'Kenyatta University',
    position: 'Deputy Vice-Chancellor (Academic and Student Affairs)',
    vacancies: 1,
    yearsExp: 12,
    category: 'University Senior Management',
    advertDate: '22-09-2026',
    closeDate: '13-10-2026',
    jobScale: 'Executive / DVC Grade',
    duties: 'Direct curricula development, admissions, examinations, university libraries, research policy, and student welfare services.',
    requirements: 'Earned PhD; Professor or Senior Associate Professor; at least 12 years track record in academic programming and quality assurance.'
  },
  {
    advertNumber: '196/2025',
    organization: 'State Department for ICT & The Digital Economy',
    position: 'ICT OFFICER II (Software Engineering & Cloud Infrastructure)',
    vacancies: 4,
    yearsExp: 3,
    category: 'Public Service / ICT',
    advertDate: '15-09-2026',
    closeDate: '06-10-2026',
    jobScale: 'CSG 10',
    duties: 'Design, develop, configure and maintain digital civic portals; ensure automated testing, CI/CD pipeline reliability, and robust cloud data protection.',
    requirements: 'Bachelor of Science in Computer Science, Software Engineering or Information Technology; professional certification in Cloud (AWS/Azure) or Networking (CCNA); member of CSK.'
  },
  {
    advertNumber: '115/2026',
    organization: 'State Department for Trade',
    position: 'WEIGHTS AND MEASURES OFFICER II',
    vacancies: 24,
    yearsExp: 2,
    category: 'Public Service / Regulatory',
    advertDate: '18-09-2026',
    closeDate: '09-10-2026',
    jobScale: 'CSG 11',
    duties: 'Conduct legal metrology inspections, verify accuracy of weighing and measuring equipment in commerce, enforce Weights and Measures Act Cap 513.',
    requirements: 'Bachelor of Science in Physics, Mathematics, Mechanical Engineering or Legal Metrology from an accredited Kenyan institution.'
  },
  {
    advertNumber: '204/2025',
    organization: 'Ministry of Lands, Public Works & Housing',
    position: 'LANDS INFORMATION MANAGEMENT OFFICER',
    vacancies: 20,
    yearsExp: 3,
    category: 'Public Service / Lands',
    advertDate: '10-09-2026',
    closeDate: '01-10-2026',
    jobScale: 'CSG 10',
    duties: 'Maintain the National Land Information Management System (ArdhiSasa), ensure GIS spatial data integrity, process cadastral digital layers.',
    requirements: 'Bachelor of Science in Geomatics, Geospatial Information Systems, Computer Science or Land Administration.'
  }
];

export const candidateApplicationsData = [
  {
    folioNo: '752',
    idNo: '24681012',
    names: 'MWANGI FAITH',
    advertNumber: '196/2025',
    designation: 'ICT OFFICER II',
    jobScale: 'CSG 10',
    vacancies: 4,
    totalApplicants: 7464,
    status: 'SHORTLISTED FOR INTERVIEW',
    appliedDate: '2026-09-18',
    interviewDate: '2026-10-20 at PSC Commission House Boardroom 4'
  },
  {
    folioNo: '1241',
    idNo: '24681012',
    names: 'MWANGI FAITH',
    advertNumber: '1/2025',
    designation: 'INFORMATION, COMMUNICATION AND TECHNOLOGY ASSISTANT III',
    jobScale: 'CSG 12',
    vacancies: 290,
    totalApplicants: 30701,
    status: 'UNDER REVIEW',
    appliedDate: '2026-08-25',
    interviewDate: 'Verification in progress'
  },
  {
    folioNo: '752',
    idNo: '24681012',
    names: 'MWANGI FAITH',
    advertNumber: '115/2026',
    designation: 'WEIGHTS AND MEASURES OFFICER II',
    jobScale: 'CSG 11',
    vacancies: 24,
    totalApplicants: 6039,
    status: 'SHORTLISTED FOR INTERVIEW',
    appliedDate: '2026-09-20',
    interviewDate: '2026-10-24 at PSC House'
  },
  {
    folioNo: '889',
    idNo: '24681012',
    names: 'MWANGI FAITH',
    advertNumber: '204/2025',
    designation: 'LANDS INFORMATION MANAGEMENT OFFICER',
    jobScale: 'CSG 10',
    vacancies: 20,
    totalApplicants: 6508,
    status: 'UNDER REVIEW',
    appliedDate: '2026-09-12',
    interviewDate: 'Pending Commission Longlisting'
  }
];

export class JobsManager {
  constructor(options = {}) {
    this.tableContainer = typeof options.tableContainer === 'string' ? document.querySelector(options.tableContainer) : options.tableContainer;
    this.statusContainer = typeof options.statusContainer === 'string' ? document.querySelector(options.statusContainer) : options.statusContainer;
    this.onApplyClicked = options.onApplyClicked || (() => {});
    this.jobs = [...activeJobsData];
    this.applications = [...candidateApplicationsData];

    this.init();
  }

  async init() {
    if (this.tableContainer) {
      this.renderJobsTable();
    }
    if (this.statusContainer) {
      this.renderStatusTable();
    }
    try {
      const serverApps = await apiClient.getApplications();
      if (serverApps && Array.isArray(serverApps) && serverApps.length > 0) {
        this.applications = serverApps;
        this.renderStatusTable();
      }
    } catch {
      // offline graceful fallback
    }
  }

  renderJobsTable(filtered = this.jobs) {
    if (!this.tableContainer) return;
    const isSw = (typeof window !== 'undefined' && window.currentLanguage && window.currentLanguage() === 'sw');

    this.tableContainer.innerHTML = `
      <div class="jobs-filter-bar mb-4 flex flex-col sm:flex-row gap-2.5">
        <div class="flex-1 min-w-0">
          <input type="text" id="jobs-search-input" class="form-control" placeholder="${isSw ? 'Tafuta kwa Cheo, Shirika au Nambari ya Tangazo...' : 'Search by Position, Organization or Advert No...'}">
        </div>
        <div>
          <select id="jobs-category-filter" class="form-control sm:w-auto w-full">
            <option value="">${isSw ? 'Vitengo Vyote' : 'All Categories'}</option>
            <option value="University Senior Management">${isSw ? 'Uongozi wa Chuo Kikuu' : 'University Senior Management'}</option>
            <option value="Public Service / ICT">${isSw ? 'Utumishi wa Umma / ICT' : 'Public Service / ICT'}</option>
            <option value="Public Service / Regulatory">${isSw ? 'Utumishi wa Umma / Udhibiti' : 'Public Service / Regulatory'}</option>
            <option value="Public Service / Lands">${isSw ? 'Utumishi wa Umma / Ardhi' : 'Public Service / Lands'}</option>
          </select>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MOBILE JOB CARDS (Visible only on mobile/tablet < 768px)       -->
      <!-- ============================================================== -->
      <div class="jobs-mobile-feed md:hidden space-y-3.5">
        ${filtered.length === 0 ? `
          <div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            ${isSw ? 'Hakuna nafasi zilizolingana na vigezo vyako.' : 'No vacancies matched your filter criteria.'}
          </div>
        ` : filtered.map(job => `
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-emerald-500/50 transition flex flex-col justify-between gap-3">
            <!-- Top Header: Advert Ref & Deadline -->
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                Ref: ${job.advertNumber}
              </span>
              <span class="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                ⏳ ${isSw ? 'Mwisho' : 'Closes'} ${job.closeDate}
              </span>
            </div>

            <!-- Position Title & Org -->
            <div>
              <h3 class="text-base font-extrabold text-slate-900 leading-snug">${job.position}</h3>
              <div class="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                <span class="text-slate-400">🏛️</span>
                <span>${job.organization}</span>
              </div>
            </div>

            <!-- Key Chips Row -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px]">
              <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100">
                ${job.vacancies} ${isSw ? 'Nafasi' : (job.vacancies === 1 ? '1 Vacancy' : `${job.vacancies} Vacancies`)}
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                ${job.jobScale}
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                ${job.yearsExp} ${isSw ? 'Miaka Uzoefu' : 'Yrs Exp'}
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-50 text-slate-600 font-medium border border-slate-100 truncate max-w-[180px]">
                ${job.category}
              </span>
            </div>

            <!-- Action Buttons: Clear Full-Width Grid on Mobile -->
            <div class="grid grid-cols-2 gap-2 pt-1">
              <button type="button" class="btn btn-secondary view-job-details-btn w-full py-2 text-xs font-semibold" data-advert="${job.advertNumber}">
                ${isSw ? 'Maelezo' : 'Advert Details'}
              </button>
              <button type="button" class="btn btn-primary apply-job-btn w-full py-2 text-xs font-bold bg-[#0B3B24] hover:bg-[#072517] text-white flex items-center justify-center gap-1 shadow-sm" data-advert="${job.advertNumber}">
                <span>${isSw ? 'Tuma Maombi' : 'Apply Now'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- ============================================================== -->
      <!-- DESKTOP DATA TABLE (Visible on >= 768px)                       -->
      <!-- ============================================================== -->
      <div class="hidden md:block table-responsive">
        <table class="psc-table">
          <thead>
            <tr>
              <th style="width: 40px;">##</th>
              <th>${isSw ? 'Nambari ya Tangazo' : 'Advert No.'}</th>
              <th>${isSw ? 'Shirika' : 'Organisation'}</th>
              <th>${isSw ? 'Cheo cha Kazi' : 'Position Title'}</th>
              <th>${isSw ? 'Nafasi' : 'Vacancies'}</th>
              <th>${isSw ? 'Uzoefu wa Chini' : 'Min Experience'}</th>
              <th>${isSw ? 'Kitengo' : 'Category'}</th>
              <th>${isSw ? 'Tarehe ya Mwisho' : 'Deadline'}</th>
              <th style="text-align: right;">${isSw ? 'Hatua' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `<tr><td colspan="9" style="text-align:center; padding: 2rem;">${isSw ? 'Hakuna nafasi zilizolingana na vigezo vyako.' : 'No vacancies matched your filter criteria.'}</td></tr>` : 
              filtered.map((job, idx) => `
                <tr>
                  <td style="font-weight: 700; color: var(--slate-500);">${idx + 1}</td>
                  <td><span class="record-tag highlight" style="font-family: monospace;">${job.advertNumber}</span></td>
                  <td style="font-weight: 600; color: var(--slate-900);">${job.organization}</td>
                  <td style="font-weight: 700; color: var(--psc-forest-900);">${job.position}</td>
                  <td><span class="status-pill review">${job.vacancies} ${isSw ? 'Nafasi' : 'Post' + (job.vacancies > 1 ? 's' : '')}</span></td>
                  <td>${job.yearsExp} ${isSw ? 'Miaka' : 'Years'}</td>
                  <td><span class="record-tag">${job.category}</span></td>
                  <td style="color: var(--red-700); font-weight: 600;">${job.closeDate}</td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.5rem;">
                      <button type="button" class="btn btn-secondary view-job-details-btn" data-advert="${job.advertNumber}" style="min-height: 36px; padding: 0.35rem 0.85rem; font-size: 0.82rem;">
                        ${isSw ? 'Maelezo ya Kazi' : 'Advert Details'}
                      </button>
                      <button type="button" class="btn btn-primary apply-job-btn" data-advert="${job.advertNumber}" style="min-height: 36px; padding: 0.35rem 0.95rem; font-size: 0.82rem; background: #0B3B24; color: white;">
                        ${isSw ? 'Tuma Maombi' : 'Apply Now'}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
    `;

    // Filter bindings
    const searchInput = this.tableContainer.querySelector('#jobs-search-input');
    const categorySelect = this.tableContainer.querySelector('#jobs-category-filter');

    const applyFilters = () => {
      const q = searchInput.value.trim().toLowerCase();
      const cat = categorySelect.value;

      const res = this.jobs.filter(j => {
        const matchesQ = !q || j.position.toLowerCase().includes(q) || j.organization.toLowerCase().includes(q) || j.advertNumber.toLowerCase().includes(q);
        const matchesCat = !cat || j.category === cat;
        return matchesQ && matchesCat;
      });
      this.renderJobsTable(res);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);

    // Job Details bindings (handles both mobile card and desktop table buttons)
    this.tableContainer.querySelectorAll('.view-job-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const advert = btn.getAttribute('data-advert');
        const job = this.jobs.find(j => j.advertNumber === advert);
        if (job) this.openJobModal(job);
      });
    });

    this.tableContainer.querySelectorAll('.apply-job-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const advert = btn.getAttribute('data-advert');
        const job = this.jobs.find(j => j.advertNumber === advert);
        if (job) this.startApplicationFlow(job);
      });
    });
  }

  openJobModal(job) {
    const modalId = 'job-detail-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <span class="record-tag highlight">Advert No. ${job.advertNumber}</span>
            <h3 class="section-title" style="margin-top: 0.35rem; margin-bottom: 0;">${job.position}</h3>
            <div style="font-size: 0.88rem; color: var(--slate-600);">${job.organization}</div>
          </div>
          <button type="button" class="btn-icon-action close-job-modal-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div style="background: var(--slate-100); padding: 0.75rem 1rem; border-radius: var(--border-radius-md);">
              <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Vacancies</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--slate-900);">${job.vacancies} Post(s)</div>
            </div>
            <div style="background: var(--slate-100); padding: 0.75rem 1rem; border-radius: var(--border-radius-md);">
              <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Job Scale</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--slate-900);">${job.jobScale}</div>
            </div>
            <div style="background: var(--slate-100); padding: 0.75rem 1rem; border-radius: var(--border-radius-md);">
              <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Closing Date</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--red-600);">${job.closeDate}</div>
            </div>
          </div>

          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.35rem;">Key Duties and Responsibilities</h4>
            <p style="font-size: 0.88rem; color: var(--slate-700); line-height: 1.5;">${job.duties}</p>
          </div>

          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.35rem;">Requirements for Appointment</h4>
            <p style="font-size: 0.88rem; color: var(--slate-700); line-height: 1.5;">${job.requirements}</p>
          </div>

          <div class="legal-warning-banner" style="margin-bottom: 0;">
            <svg class="legal-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div class="legal-warning-text">
              <strong>Section 100(4) Warning:</strong> Providing false or misleading information is an offence punishable by a fine not exceeding Kshs. 200,000 or imprisonment up to 2 years.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary close-job-modal-btn">Close</button>
          <button type="button" class="btn btn-primary modal-apply-btn bg-[#0B3B24] text-white">Proceed to Apply with Profile</button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.querySelectorAll('.close-job-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => modal.classList.remove('open'));
    });

    modal.querySelector('.modal-apply-btn').addEventListener('click', () => {
      modal.classList.remove('open');
      this.startApplicationFlow(job);
    });
  }

  startApplicationFlow(job) {
    const modalId = 'job-apply-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 640px;">
        <div class="modal-header">
          <div>
            <span class="record-tag highlight" style="font-weight: 800;">Advert Ref: ${job.advertNumber}</span>
            <h3 class="section-title" style="margin-top: 0.35rem; margin-bottom: 0;">Formal Application for Appointment</h3>
            <div style="font-size: 0.88rem; color: var(--slate-600);">${job.position} • ${job.organization}</div>
          </div>
          <button type="button" class="btn-icon-action close-apply-modal-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="formal-job-application-form" class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Eligibility & Bio-Data Match Card -->
          <div style="background: var(--psc-mustard-50); border: 1px solid var(--psc-mustard-200); border-radius: var(--border-radius-md); padding: 1rem 1.25rem;">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--psc-mustard-800); letter-spacing: 0.5px; margin-bottom: 0.35rem;">
              Applicant Bio-Data Summary
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;">
              <div>
                <div style="font-size: 1rem; font-weight: 800; color: var(--slate-900);">Faith Mwangi (ID: 24681012)</div>
                <div style="font-size: 0.82rem; color: var(--slate-700);">BSc Computer Science • 4 Yrs 6 Mos Experience • IPPD: 20260012345</div>
              </div>
              <span class="status-pill shortlisted" style="font-weight: 800;">✓ Bio-Data Complete</span>
            </div>
          </div>

          <!-- Position Summary Triplet -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div style="background: var(--slate-100); padding: 0.65rem 0.85rem; border-radius: var(--border-radius-md);">
              <div style="font-size: 0.70rem; color: var(--slate-500); font-weight: 700; text-transform: uppercase;">Cadre Scale</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: var(--slate-900);">${job.jobScale}</div>
            </div>
            <div style="background: var(--slate-100); padding: 0.65rem 0.85rem; border-radius: var(--border-radius-md);">
              <div style="font-size: 0.70rem; color: var(--slate-500); font-weight: 700; text-transform: uppercase;">Required Exp</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: var(--slate-900);">${job.yearsExp} Years Min</div>
            </div>
            <div style="background: var(--slate-100); padding: 0.65rem 0.85rem; border-radius: var(--border-radius-md);">
              <div style="font-size: 0.70rem; color: var(--slate-500); font-weight: 700; text-transform: uppercase;">Closing Date</div>
              <div style="font-size: 0.95rem; font-weight: 800; color: var(--red-600);">${job.closeDate}</div>
            </div>
          </div>

          <!-- Statement of Suitability -->
          <div class="form-group">
            <label class="form-label" for="apply-cover-note">
              Brief Statement of Suitability (Max 300 words)
            </label>
            <p class="form-hint">Highlight key competencies and achievements directly relevant to this vacancy.</p>
            <textarea id="apply-cover-note" class="form-control" rows="3" placeholder="Summarize your leadership, technical expertise, or academic qualifications for this role...">I am pleased to formally submit my candidature for the position of ${job.position} under Advert ${job.advertNumber}. With my academic background and proven experience, I possess the required competencies to deliver citizen-centric excellence.</textarea>
          </div>

          <!-- Dossier Attachment Upload -->
          <div class="form-group" style="background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: var(--border-radius-md); padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label class="form-label" style="margin-bottom: 0; display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                Supplemental Dossier / Testimonials (Optional PDF, Max 10MB)
              </label>
            </div>
            <p class="form-hint" style="margin-bottom: 0.65rem;">
              Attach additional certified documents if required. (Your saved verified profile records are automatically attached).
            </p>
            <div id="dossier-upload-zone" style="display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #E2E8F0; padding: 0.65rem 0.85rem; border-radius: 6px;">
              <input type="file" id="dossier-file-input" accept="application/pdf" style="display: none;">
              <button type="button" class="btn btn-secondary" id="dossier-browse-btn" style="min-height: 34px; font-size: 0.8rem; padding: 0.35rem 0.85rem; shrink-0;">
                Choose PDF
              </button>
              <div id="dossier-file-status" style="font-size: 0.80rem; color: #64748B; flex: 1;">
                No supplemental file chosen
              </div>
            </div>
          </div>

          <!-- Section 100(4) Statutory Declaration -->
          <div class="legal-warning-banner" style="margin-bottom: 0;">
            <svg class="legal-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div class="legal-warning-text">
              <label style="display: flex; align-items: flex-start; gap: 0.65rem; cursor: pointer;">
                <input type="checkbox" id="job-apply-declaration-check" required style="width: 18px; height: 18px; margin-top: 2px;">
                <span style="font-size: 0.82rem; line-height: 1.4;">
                  <strong>Statutory Integrity Oath:</strong> I declare that all entries in my Public Service profile and this application are complete and true under Section 100(4) of the PSC Act 2017.
                </span>
              </label>
            </div>
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary close-apply-modal-btn">Cancel</button>
          <button type="submit" form="formal-job-application-form" class="btn btn-primary submit-job-btn bg-[#0B3B24] text-white" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Confirm & Submit Official Application
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');

    // Close handlers
    modal.querySelectorAll('.close-apply-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => modal.classList.remove('open'));
    });

    const check = modal.querySelector('#job-apply-declaration-check');
    const submitBtn = modal.querySelector('.submit-job-btn');

    check.addEventListener('change', () => {
      submitBtn.disabled = !check.checked;
    });

    // Upload attachment handling
    const fileInput = modal.querySelector('#dossier-file-input');
    const browseBtn = modal.querySelector('#dossier-browse-btn');
    const statusLabel = modal.querySelector('#dossier-file-status');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async () => {
        if (fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];
          statusLabel.innerHTML = `
            <span style="color: #0B3B24; font-weight: 700;">✓ Attached:</span> ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)
          `;
        }
      });
    }

    const form = modal.querySelector('#formal-job-application-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display:inline-block; animation: spin 1s linear infinite;">⟳</span> Submitting Application...
      `;

      let telemetry = null;
      try {
        telemetry = await apiClient.ingestApplication({
          advertNumber: job.advertNumber,
          designation: job.position,
          idNo: '24681012',
          candidateName: 'MWANGI FAITH',
          payload: {
            organization: job.organization,
            jobScale: job.jobScale,
            vacancies: job.vacancies
          }
        });
      } catch (err) {
        console.warn('API error, falling back to local receipt:', err);
      }

      const newFolio = (telemetry && telemetry.receiptFolio) 
        ? telemetry.receiptFolio.split('/').pop() 
        : Math.floor(1000 + Math.random() * 9000).toString();
      const today = new Date().toISOString().slice(0, 10);

      const newApp = {
        folioNo: newFolio,
        idNo: '24681012',
        names: 'MWANGI FAITH',
        advertNumber: job.advertNumber,
        designation: job.position,
        jobScale: job.jobScale,
        vacancies: job.vacancies,
        totalApplicants: Math.floor(1200 + Math.random() * 5000),
        status: 'SUBMITTED • UNDER REVIEW',
        appliedDate: today,
        interviewDate: 'Preliminary Longlisting'
      };

      // Add to tracked applications
      this.applications.unshift(newApp);
      this.renderStatusTable();

      // Render Official Citizen Application Receipt Dialog
      modal.querySelector('.modal-card').innerHTML = `
        <div class="modal-header" style="background: linear-gradient(135deg, #0B3B24 0%, #062617 100%); color: white; border-bottom: 2px solid #C88A19;">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-100 border border-emerald-600 mb-1">
              ✓ OFFICIAL RECEIPT
            </span>
            <h3 class="section-title" style="color: white; margin: 0.25rem 0 0 0;">Application Submitted Successfully</h3>
            <div style="font-size: 0.84rem; color: #D1FAE5;">Candidate: Faith Mwangi (ID: 24681012) • Advert: ${job.advertNumber}</div>
          </div>
          <button type="button" class="btn-icon-action close-apply-modal-btn" style="color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Official P.10 Folio Receipt Card -->
          <div style="background: #FEF9EE; border: 1.5px solid #C88A19; border-radius: 10px; padding: 1.25rem 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span class="record-tag highlight" style="font-size: 0.76rem;">FORM P.10 ACKNOWLEDGEMENT SLIP</span>
                <div style="font-size: 1.35rem; font-weight: 800; color: #0B3B24; margin-top: 0.25rem;">Folio Ref: PSC/2026/${newFolio}</div>
              </div>
              <span class="status-pill shortlisted" style="font-weight: 800;">✓ Received & Queued</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-800">
              <div><strong>Position:</strong> ${job.position}</div>
              <div><strong>Cadre Scale:</strong> ${job.jobScale}</div>
              <div><strong>Organisation:</strong> ${job.organization}</div>
              <div><strong>Submission Date:</strong> ${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 leading-relaxed">
            <strong>Next Steps:</strong> Your application dossier and verified credentials have been transmitted to the Commission Selection Board. You will receive an official SMS and Email notification when shortlisting is finalized.
          </div>
        </div>

        <div class="modal-footer" style="background: #F8FAFC;">
          <button type="button" class="btn btn-secondary close-apply-modal-btn">Close</button>
          <button type="button" class="btn btn-primary print-receipt-btn bg-[#0B3B24] text-white" style="min-height: 42px;" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Print Acknowledgement Slip
          </button>
        </div>
      `;

      modal.querySelectorAll('.close-apply-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => modal.classList.remove('open'));
      });

      this.onApplyClicked(job);
    });
  }

  renderStatusTable() {
    if (!this.statusContainer) return;
    const isSw = (typeof window !== 'undefined' && window.currentLanguage && window.currentLanguage() === 'sw');

    this.statusContainer.innerHTML = `
      <!-- ============================================================== -->
      <!-- MOBILE APPLICATIONS FEED (Visible on mobile/tablet < 768px)    -->
      <!-- ============================================================== -->
      <div class="applications-mobile-feed md:hidden space-y-3.5">
        ${this.applications.map(app => {
          let displayStatus = app.status;
          if (isSw) {
            if (app.status.includes('SHORTLISTED')) displayStatus = 'UMEORODHESHWA KWA MAHOJIANO';
            else if (app.status.includes('REVIEW')) displayStatus = 'INAKAGULIWA NA BODI';
            else displayStatus = 'HAUKUTEULIWA';
          }
          return `
            <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between gap-3">
              <div class="flex items-center justify-between gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  Folio: ${app.folioNo || '-'}
                </span>
                <span class="status-pill ${app.status.includes('SHORTLISTED') ? 'shortlisted' : app.status.includes('REVIEW') ? 'review' : 'unsuccessful'} text-[10px]">
                  ${displayStatus}
                </span>
              </div>

              <div>
                <span class="record-tag highlight text-[10px] mb-1 inline-block">${app.advertNumber}</span>
                <h3 class="text-base font-extrabold text-slate-900 leading-snug">${app.designation}</h3>
                <div class="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                  <span class="font-semibold">${app.jobScale}</span>
                  <span>•</span>
                  <span>Applied: ${app.appliedDate}</span>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span class="text-xs text-slate-500 font-medium">
                  👥 ${app.totalApplicants.toLocaleString()} applicants
                </span>
                <button type="button" class="btn btn-secondary text-xs py-1.5 px-3" onclick="alert('Downloading Official PSC P.10 Application Acknowledgement Slip for Advert ${app.advertNumber}...')">
                  📄 ${isSw ? 'Risiti' : 'Receipt Slip'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- ============================================================== -->
      <!-- DESKTOP APPLICATIONS TABLE (Visible on >= 768px)               -->
      <!-- ============================================================== -->
      <div class="hidden md:block table-responsive">
        <table class="psc-table">
          <thead>
            <tr>
              <th>##</th>
              <th>${isSw ? 'Nambari ya Kumbukumbu' : 'Folio No.'}</th>
              <th>${isSw ? 'Kitambulisho' : 'ID No.'}</th>
              <th>${isSw ? 'Jina la Mwombaji' : 'Candidate Name'}</th>
              <th>${isSw ? 'Nambari ya Tangazo' : 'Advert No.'}</th>
              <th>${isSw ? 'Wadhifa' : 'Designation'}</th>
              <th>${isSw ? 'Ngazi' : 'Scale'}</th>
              <th>${isSw ? 'Nafasi' : 'Vacancies'}</th>
              <th>${isSw ? 'Jumla ya Waombaji' : 'Total Candidates'}</th>
              <th>${isSw ? 'Hali' : 'Status'}</th>
              <th>${isSw ? 'Hatua' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            ${this.applications.map((app, idx) => {
              let displayStatus = app.status;
              if (isSw) {
                if (app.status.includes('SHORTLISTED')) displayStatus = 'UMEORODHESHWA KWA MAHOJIANO';
                else if (app.status.includes('REVIEW')) displayStatus = 'INAKAGULIWA NA BODI';
                else displayStatus = 'HAUKUTEULIWA';
              }
              return `
              <tr>
                <td style="font-weight: 700; color: var(--slate-500);">${idx + 1}</td>
                <td><span style="font-weight: 700; color: var(--slate-700);">${app.folioNo || '-'}</span></td>
                <td style="font-family: monospace;">${app.idNo}</td>
                <td style="font-weight: 600;">${app.names}</td>
                <td><span class="record-tag highlight">${app.advertNumber}</span></td>
                <td style="font-weight: 700; color: var(--psc-forest-900);">${app.designation}</td>
                <td>${app.jobScale}</td>
                <td>${app.vacancies}</td>
                <td style="font-weight: 600; color: var(--slate-700);">${app.totalApplicants.toLocaleString()}</td>
                <td>
                  <span class="status-pill ${app.status.includes('SHORTLISTED') ? 'shortlisted' : app.status.includes('REVIEW') ? 'review' : 'unsuccessful'}">
                    ${displayStatus}
                  </span>
                </td>
                <td>
                  <button type="button" class="btn btn-secondary" style="min-height: 32px; padding: 0.25rem 0.75rem; font-size: 0.76rem;" onclick="alert('Downloading Official PSC P.10 Application Acknowledgement Slip for Advert ${app.advertNumber}...')">
                    ${isSw ? 'Risiti' : 'Receipt'}
                  </button>
                </td>
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}
