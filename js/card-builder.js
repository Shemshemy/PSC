/**
 * PSCIMS 2.0 - Structured Card Builder Component
 * Replaces stacked 15-field manual tables with clean structured card summaries
 * and accessible "Add / Edit Record" modal drawers.
 */

import { profileStore } from './profile-data.js';

export class CardBuilder {
  constructor(options = {}) {
    this.container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
    this.type = options.type; // 'academic', 'highSchool', 'professional', 'employment', 'referees', 'publications', 'professionalBodies'
    this.title = options.title || 'Record';
    this.addBtnLabel = options.addBtnLabel || `+ Add ${this.title}`;
    this.onUpdate = options.onUpdate || (() => {});

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  getRecords() {
    const p = profileStore.get();
    switch (this.type) {
      case 'academic': return p.academicQualifications || [];
      case 'highSchool': return p.highSchoolQualifications || [];
      case 'professional': return p.professionalQualifications || [];
      case 'employment': return p.employmentHistory || [];
      case 'referees': return p.referees || [];
      case 'publications': return p.publications || [];
      case 'professionalBodies': return p.professionalBodies || [];
      case 'otherCourses': return p.otherCourses || [];
      default: return [];
    }
  }

  setRecords(updatedList) {
    const keyMap = {
      academic: 'academicQualifications',
      highSchool: 'highSchoolQualifications',
      professional: 'professionalQualifications',
      employment: 'employmentHistory',
      referees: 'referees',
      publications: 'publications',
      professionalBodies: 'professionalBodies',
      otherCourses: 'otherCourses'
    };
    const key = keyMap[this.type];
    if (key) {
      profileStore.set({ [key]: updatedList });
      this.onUpdate();
      this.render();
    }
  }

  render() {
    const records = this.getRecords();

    this.container.innerHTML = `
      <div class="card-builder-section">
        <div class="card-builder-header">
          <div>
            <h4 class="section-title" style="margin-bottom: 2px;">${this.title}</h4>
            <p class="section-desc" style="margin-bottom: 0;">${records.length} record(s) recorded and validated.</p>
          </div>
          <button type="button" class="btn btn-primary add-record-btn" style="min-height: 38px; padding: 0.45rem 1rem; font-size: 0.85rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            ${this.addBtnLabel}
          </button>
        </div>

        <div class="card-records-grid">
          ${records.length === 0 ? this.renderEmptyState() : records.map(r => this.renderRecordCard(r)).join('')}
        </div>
      </div>
    `;

    this.bindCardActions();
  }

  renderEmptyState() {
    return `
      <div class="empty-records-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="16" rx="3"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="13" x2="15" y2="13"></line>
        </svg>
        <div class="empty-title">No ${this.title.toLowerCase()} records captured yet</div>
        <div class="empty-desc">Click "${this.addBtnLabel}" above to capture your qualifications or experience details.</div>
      </div>
    `;
  }

  renderRecordCard(record) {
    let mainTitle = '';
    let subtitle = '';
    let metaTags = '';

    if (this.type === 'academic') {
      mainTitle = record.course;
      subtitle = `${record.institutionName} • ${record.specialisation || record.areaOfStudy}`;
      metaTags = `
        <span class="record-tag highlight">${record.award}</span>
        <span class="record-tag">${record.grade}</span>
        <span class="record-tag">${record.endDate ? `Graduated: ${record.endDate.slice(0,4)}` : 'Completed'}</span>
        ${record.certificateNo ? `<span class="record-tag">Cert: ${record.certificateNo}</span>` : ''}
      `;
    } else if (this.type === 'highSchool') {
      mainTitle = `${record.schoolName} (${record.examType})`;
      subtitle = record.award || record.schoolLevel;
      metaTags = `
        <span class="record-tag highlight">Grade: ${record.grade}</span>
        <span class="record-tag">Year: ${record.completionYear || 'Completed'}</span>
        ${record.indexNumber ? `<span class="record-tag">Index: ${record.indexNumber}</span>` : ''}
      `;
    } else if (this.type === 'employment') {
      mainTitle = record.designation;
      subtitle = `${record.organization} • ${record.category}`;
      metaTags = `
        <span class="record-tag highlight">${record.jobScale || 'Grade CSG'}</span>
        <span class="record-tag">Gross: Ksh. ${record.grossMonthlySalary}</span>
        <span class="record-tag">${record.startDate} to ${record.endDate}</span>
      `;
    } else if (this.type === 'referees') {
      mainTitle = record.fullName;
      subtitle = `${record.occupation} • ${record.postalCity || 'Kenya'}`;
      metaTags = `
        <span class="record-tag highlight">Tel: ${record.mobileNumber}</span>
        <span class="record-tag">Email: ${record.emailAddress}</span>
        <span class="record-tag">Known: ${record.periodKnown}</span>
      `;
    } else if (this.type === 'professional') {
      mainTitle = record.course;
      subtitle = `${record.institutionName} • ${record.specialisation}`;
      metaTags = `
        <span class="record-tag highlight">${record.award}</span>
        <span class="record-tag">Grade: ${record.grade}</span>
        ${record.certificateNo ? `<span class="record-tag">Reg: ${record.certificateNo}</span>` : ''}
      `;
    } else if (this.type === 'professionalBodies') {
      mainTitle = record.professionalBody;
      subtitle = record.membershipType;
      metaTags = `
        <span class="record-tag highlight">Reg: ${record.registrationNumber}</span>
        <span class="record-tag">Expires: ${record.expiryDate}</span>
      `;
    } else if (this.type === 'publications') {
      mainTitle = record.title;
      subtitle = `${record.publisher} (${record.year})`;
      metaTags = `<span class="record-tag highlight">${record.category}</span>`;
    } else if (this.type === 'otherCourses') {
      mainTitle = record.courseName;
      subtitle = record.institutionName;
      metaTags = `
        <span class="record-tag highlight">Cert: ${record.certificateNo}</span>
        <span class="record-tag">${record.startDate} - ${record.endDate}</span>
      `;
    }

    return `
      <div class="record-summary-card" data-id="${record.id}">
        <div class="record-info">
          <div class="record-title">${mainTitle}</div>
          <div class="record-subtitle">${subtitle}</div>
          <div class="record-meta">${metaTags}</div>
        </div>
        <div class="record-actions">
          <button type="button" class="btn-icon-action edit-record-btn" title="Edit this record" data-id="${record.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn-icon-action delete delete-record-btn" title="Delete record" data-id="${record.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-record-btn');
      if (addBtn) {
        this.openRecordModal();
      }
    });
  }

  bindCardActions() {
    this.container.querySelectorAll('.delete-record-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to remove this verified record from your application?')) {
          const current = this.getRecords();
          this.setRecords(current.filter(r => r.id !== id));
        }
      });
    });

    this.container.querySelectorAll('.edit-record-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const current = this.getRecords();
        const record = current.find(r => r.id === id);
        if (record) {
          this.openRecordModal(record);
        }
      });
    });
  }

  openRecordModal(existingRecord = null) {
    const modalId = 'card-builder-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const isEdit = !!existingRecord;
    const modalTitle = isEdit ? `Edit ${this.title}` : `Add New ${this.title}`;

    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="section-title" style="margin-bottom:0;">${modalTitle}</h3>
          <button type="button" class="btn-icon-action close-modal-btn" aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form id="card-modal-form" class="modal-body form-flow" style="max-width: 100%;">
          ${this.getFormFieldsForType(existingRecord)}
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary close-modal-btn">Cancel</button>
          <button type="submit" form="card-modal-form" class="btn btn-primary">
            ${isEdit ? 'Save Changes' : 'Add to Application'}
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');

    // Close handlers
    modal.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => modal.classList.remove('open'));
    });

    // Form submit
    const form = modal.querySelector('#card-modal-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const current = this.getRecords();
      if (isEdit) {
        const updated = current.map(r => r.id === existingRecord.id ? { ...existingRecord, ...data } : r);
        this.setRecords(updated);
      } else {
        const newRecord = {
          id: `${this.type}-${Date.now()}`,
          ...data
        };
        this.setRecords([...current, newRecord]);
      }

      modal.classList.remove('open');
    });
  }

  getFormFieldsForType(rec = null) {
    rec = rec || {};
    if (this.type === 'academic') {
      return `
        <div class="form-group">
          <label class="form-label">Institution / University <span class="required-star">*</span></label>
          <input type="text" name="institutionName" required class="form-control" value="${rec.institutionName || ''}" placeholder="e.g. Maseno University, University of Nairobi">
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Area of Study <span class="required-star">*</span></label>
            <input type="text" name="areaOfStudy" required class="form-control" value="${rec.areaOfStudy || ''}" placeholder="e.g. Computing and Information Sciences">
          </div>
          <div class="form-group">
            <label class="form-label">Specialisation <span class="required-star">*</span></label>
            <input type="text" name="specialisation" required class="form-control" value="${rec.specialisation || ''}" placeholder="e.g. Computer Science / Software Engineering">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Course Title <span class="required-star">*</span></label>
          <input type="text" name="course" required class="form-control" value="${rec.course || ''}" placeholder="e.g. Bachelor of Science in Computer Science">
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Award Level <span class="required-star">*</span></label>
            <select name="award" class="form-control">
              <option ${rec.award === 'Degree (BSc)' ? 'selected' : ''}>Degree (BSc)</option>
              <option ${rec.award === 'Diploma' ? 'selected' : ''}>Diploma</option>
              <option ${rec.award === 'Master\'s Degree' ? 'selected' : ''}>Master's Degree</option>
              <option ${rec.award === 'Doctorate (PhD)' ? 'selected' : ''}>Doctorate (PhD)</option>
              <option ${rec.award === 'Postgraduate Diploma' ? 'selected' : ''}>Postgraduate Diploma</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Classification / Grade <span class="required-star">*</span></label>
            <input type="text" name="grade" required class="form-control" value="${rec.grade || ''}" placeholder="e.g. Second Class Honours (Upper Division), Distinction">
          </div>
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Certificate Number</label>
            <input type="text" name="certificateNo" class="form-control" value="${rec.certificateNo || ''}" placeholder="e.g. MSU/DEG/2021/4491">
          </div>
          <div class="form-group">
            <label class="form-label">Graduation Date</label>
            <input type="date" name="endDate" class="form-control" value="${rec.endDate || ''}">
          </div>
        </div>
      `;
    } else if (this.type === 'highSchool') {
      return `
        <div class="form-group">
          <label class="form-label">School Name <span class="required-star">*</span></label>
          <input type="text" name="schoolName" required class="form-control" value="${rec.schoolName || ''}" placeholder="e.g. Meteitei Secondary School">
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">School Level <span class="required-star">*</span></label>
            <select name="schoolLevel" class="form-control">
              <option ${rec.schoolLevel === 'Secondary Education Level' ? 'selected' : ''}>Secondary Education Level</option>
              <option ${rec.schoolLevel === 'Primary Education Level' ? 'selected' : ''}>Primary Education Level</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Examination Type <span class="required-star">*</span></label>
            <select name="examType" class="form-control">
              <option ${rec.examType === 'KCSE' ? 'selected' : ''}>KCSE</option>
              <option ${rec.examType === 'KCPE' ? 'selected' : ''}>KCPE</option>
              <option ${rec.examType === 'IGCSE' ? 'selected' : ''}>IGCSE / GCE</option>
            </select>
          </div>
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Grade / Mean Score <span class="required-star">*</span></label>
            <input type="text" name="grade" required class="form-control" value="${rec.grade || ''}" placeholder="e.g. B+ or 385 Marks">
          </div>
          <div class="form-group">
            <label class="form-label">Year of Completion <span class="required-star">*</span></label>
            <input type="number" name="completionYear" required class="form-control" value="${rec.completionYear || ''}" placeholder="e.g. 2016">
          </div>
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Index Number <span class="required-star">*</span></label>
            <input type="text" name="indexNumber" class="form-control" value="${rec.indexNumber || ''}" placeholder="e.g. 27537101/014">
          </div>
          <div class="form-group">
            <label class="form-label">Certificate Number</label>
            <input type="text" name="certificateNo" class="form-control" value="${rec.certificateNo || ''}" placeholder="e.g. KCSE/2016/98210">
          </div>
        </div>
      `;
    } else if (this.type === 'employment') {
      return `
        <div class="form-group">
          <label class="form-label">Designation / Job Title <span class="required-star">*</span></label>
          <input type="text" name="designation" required class="form-control" value="${rec.designation || ''}" placeholder="e.g. ICT Officer II">
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Ministry / University / Organization <span class="required-star">*</span></label>
            <input type="text" name="organization" required class="form-control" value="${rec.organization || ''}" placeholder="e.g. State Department for ICT">
          </div>
          <div class="form-group">
            <label class="form-label">Sector / Category <span class="required-star">*</span></label>
            <select name="category" class="form-control">
              <option ${rec.category === 'Public Service / ICT' ? 'selected' : ''}>Public Service / ICT</option>
              <option ${rec.category === 'State Corporation' ? 'selected' : ''}>State Corporation</option>
              <option ${rec.category === 'Private Sector' ? 'selected' : ''}>Private Sector</option>
              <option ${rec.category === 'NGO / International' ? 'selected' : ''}>NGO / International</option>
            </select>
          </div>
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Job Scale / Grade</label>
            <input type="text" name="jobScale" class="form-control" value="${rec.jobScale || ''}" placeholder="e.g. CSG 10 or Job Group K">
          </div>
          <div class="form-group">
            <label class="form-label">Monthly Gross Salary (Ksh.)</label>
            <input type="text" name="grossMonthlySalary" class="form-control" value="${rec.grossMonthlySalary || ''}" placeholder="e.g. 94,500">
          </div>
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Start Date <span class="required-star">*</span></label>
            <input type="date" name="startDate" required class="form-control" value="${rec.startDate || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">End Date (or 'Present') <span class="required-star">*</span></label>
            <input type="text" name="endDate" required class="form-control" value="${rec.endDate || ''}" placeholder="e.g. Present or 2024-01-15">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Summary of Key Responsibilities / Duties</label>
          <textarea name="natureOfDuties" class="form-control" rows="3" placeholder="Briefly describe key achievements and responsibilities">${rec.natureOfDuties || ''}</textarea>
        </div>
      `;
    } else if (this.type === 'referees') {
      return `
        <div class="form-group">
          <label class="form-label">Referee Full Names <span class="required-star">*</span></label>
          <input type="text" name="fullName" required class="form-control" value="${rec.fullName || ''}" placeholder="e.g. Dr. Calvis, Eng. Francis Mwangi">
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Designation / Occupation <span class="required-star">*</span></label>
            <input type="text" name="occupation" required class="form-control" value="${rec.occupation || ''}" placeholder="e.g. Dean of School / CEO / Director">
          </div>
          <div class="form-group">
            <label class="form-label">Period Known <span class="required-star">*</span></label>
            <input type="text" name="periodKnown" required class="form-control" value="${rec.periodKnown || ''}" placeholder="e.g. 4 years">
          </div>
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Official Mobile Telephone <span class="required-star">*</span></label>
            <input type="tel" name="mobileNumber" required class="form-control" value="${rec.mobileNumber || ''}" placeholder="e.g. 0710764518">
          </div>
          <div class="form-group">
            <label class="form-label">Official Email Address <span class="required-star">*</span></label>
            <input type="email" name="emailAddress" required class="form-control" value="${rec.emailAddress || ''}" placeholder="e.g. sokoth@maseno.ac.ke">
          </div>
        </div>
        <div class="form-row-paired">
          <div class="form-group">
            <label class="form-label">Postal Address</label>
            <input type="text" name="postalAddress" class="form-control" value="${rec.postalAddress || ''}" placeholder="e.g. P.O. Box 3275">
          </div>
          <div class="form-group">
            <label class="form-label">Postal Town / City</label>
            <input type="text" name="postalCity" class="form-control" value="${rec.postalCity || ''}" placeholder="e.g. Maseno or Nairobi">
          </div>
        </div>
      `;
    } else {
      // generic
      return `
        <div class="form-group">
          <label class="form-label">Title / Name <span class="required-star">*</span></label>
          <input type="text" name="title" required class="form-control" value="${rec.title || rec.courseName || rec.professionalBody || ''}">
        </div>
      `;
    }
  }
}
