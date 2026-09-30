/**
 * PSCIMS 2.0 - Accredited Public Service Courses Database
 * Replicates the comprehensive government course curriculum registry
 * with high-performance instant searching, award filtering, and pagination.
 */

export const coursesDatabase = [
  { code: '10001', name: 'Diploma in Cabin Crew/Air Hostess', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10002', name: 'Diploma in Travel and Tourism Management', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10003', name: 'Diploma in Air Travel Operations (Foundation)', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10004', name: 'Diploma in Air Travel Operations (Consultant)', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10005', name: 'Diploma in Airport Operations (Foundation)', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10006', name: 'Certificate in Airport Fundamentals', award: 'Certificate/TRADE TEST', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10007', name: 'Certificate in Airline Passenger Handling', award: 'Certificate/TRADE TEST', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10008', name: 'Certificate in Airport Ramp Services', award: 'Certificate/TRADE TEST', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10009', name: 'Certificate in Aviation Security', award: 'Certificate/TRADE TEST', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '1001',  name: 'Bachelor of Science (Agribusiness Management)', award: 'Degree', area: 'Agriculture & Agribusiness', areaCode: '10' },
  { code: '10010', name: 'Diploma in Air Cargo Handling', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10011', name: 'Diploma in International Freight Management', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10012', name: 'Diploma in Maritime Management', award: 'Diploma', area: 'Hospitality & Tourism', areaCode: '27' },
  { code: '10020', name: 'Bachelor of Science (Computer Science)', award: 'Degree', area: 'Computing & Information Sciences', areaCode: '14' },
  { code: '10021', name: 'Bachelor of Business Information Technology (BBIT)', award: 'Degree', area: 'Computing & Information Sciences', areaCode: '14' },
  { code: '10022', name: 'Diploma in Software Development (Full Stack)', award: 'Diploma', area: 'Computing & Information Sciences', areaCode: '14' },
  { code: '10023', name: 'Bachelor of Science in Software Engineering', award: 'Degree', area: 'Computing & Information Sciences', areaCode: '14' },
  { code: '10024', name: 'Diploma in Information Communication Technology', award: 'Diploma', area: 'Computing & Information Sciences', areaCode: '14' },
  { code: '10030', name: 'Bachelor of Laws (LL.B)', award: 'Degree', area: 'Law & Legal Studies', areaCode: '08' },
  { code: '10035', name: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)', award: 'Degree', area: 'Health & Medical Sciences', areaCode: '04' },
  { code: '10040', name: 'Bachelor of Science in Civil Engineering', award: 'Degree', area: 'Engineering & Technology', areaCode: '05' },
  { code: '10041', name: 'Bachelor of Science in Electrical and Electronic Engineering', award: 'Degree', area: 'Engineering & Technology', areaCode: '05' },
  { code: '10050', name: 'Bachelor of Commerce (Finance / Accounting Option)', award: 'Degree', area: 'Business & Economics', areaCode: '02' },
  { code: '10055', name: 'Bachelor of Education (Arts / Science)', award: 'Degree', area: 'Education', areaCode: '01' }
];

export class CoursesManager {
  constructor(container) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.courses = [...coursesDatabase];
    this.pageSize = 10;
    this.currentPage = 1;
    this.currentFilter = { text: '', award: '' };

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    const isSw = (typeof window !== 'undefined' && window.currentLanguage && window.currentLanguage() === 'sw');

    this.container.innerHTML = `
      <div class="jobs-filter-bar">
        <div style="flex: 1; min-width: 260px;">
          <label class="form-label" for="courses-query">${isSw ? 'Jina la Kozi au Msimbo' : 'Course Name or Code'}</label>
          <input type="text" id="courses-query" class="form-control" placeholder="${isSw ? 'Tafuta kwa jina la kozi (mfano Sayansi ya Kompyuta) au msimbo...' : 'Search by course title (e.g. Computer Science, Agribusiness) or code...'}">
        </div>
        <div style="min-width: 200px;">
          <label class="form-label" for="courses-award-select">${isSw ? 'Kiwango cha Cheti' : 'Award Level'}</label>
          <select id="courses-award-select" class="form-control">
            <option value="">${isSw ? 'Viwango Vyote' : 'All Award Levels'}</option>
            <option value="Degree">${isSw ? 'Shahada' : 'Degree'}</option>
            <option value="Diploma">${isSw ? 'Stashahada' : 'Diploma'}</option>
            <option value="Certificate/TRADE TEST">${isSw ? 'Cheti / Mtihani wa Ufundi' : 'Certificate / Trade Test'}</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="psc-table">
          <thead>
            <tr>
              <th style="width: 50px;">##</th>
              <th>${isSw ? 'Msimbo wa Kozi' : 'Course Code'}</th>
              <th>${isSw ? 'Jina la Kozi Iliyoidhinishwa' : 'Accredited Course Name'}</th>
              <th>${isSw ? 'Kiwango cha Cheti' : 'Award Level'}</th>
              <th>${isSw ? 'Nyanja ya Masomo' : 'Area of Study'}</th>
              <th>${isSw ? 'Msimbo' : 'Code'}</th>
            </tr>
          </thead>
          <tbody id="courses-table-body">
          </tbody>
        </table>
      </div>

      <div id="courses-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding: 0.5rem 0;">
      </div>
    `;

    this.bindEvents();
    this.updateTable();
  }

  bindEvents() {
    const qInput = this.container.querySelector('#courses-query');
    const aSelect = this.container.querySelector('#courses-award-select');

    qInput.addEventListener('input', () => {
      this.currentFilter.text = qInput.value.trim().toLowerCase();
      this.currentPage = 1;
      this.updateTable();
    });

    aSelect.addEventListener('change', () => {
      this.currentFilter.award = aSelect.value;
      this.currentPage = 1;
      this.updateTable();
    });
  }

  getFiltered() {
    const { text, award } = this.currentFilter;
    return this.courses.filter(c => {
      const matchText = !text || c.name.toLowerCase().includes(text) || c.code.toLowerCase().includes(text) || c.area.toLowerCase().includes(text);
      const matchAward = !award || c.award === award;
      return matchText && matchAward;
    });
  }

  updateTable() {
    const tbody = this.container.querySelector('#courses-table-body');
    const pagContainer = this.container.querySelector('#courses-pagination');
    const filtered = this.getFiltered();

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const paged = filtered.slice(startIdx, startIdx + this.pageSize);

    if (paged.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--slate-500);">No public service recognized courses matched your search.</td></tr>`;
      pagContainer.innerHTML = '';
      return;
    }

    tbody.innerHTML = paged.map((c, i) => `
      <tr>
        <td style="font-weight: 700; color: var(--slate-500);">${startIdx + i + 1}</td>
        <td><span class="record-tag highlight" style="font-family: monospace;">${c.code}</span></td>
        <td style="font-weight: 600; color: var(--slate-900);">${c.name}</td>
        <td><span class="record-tag">${c.award}</span></td>
        <td>${c.area}</td>
        <td><span style="font-family: monospace; color: var(--slate-600);">${c.areaCode}</span></td>
      </tr>
    `).join('');

    // Pagination
    const totalPages = Math.ceil(filtered.length / this.pageSize);
    pagContainer.innerHTML = `
      <div style="font-size: 0.85rem; color: var(--slate-600);">
        Showing <strong>${startIdx + 1}</strong> to <strong>${Math.min(startIdx + this.pageSize, filtered.length)}</strong> of <strong>${filtered.length}</strong> accredited courses
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button type="button" class="btn btn-secondary" ${this.currentPage === 1 ? 'disabled' : ''} id="courses-prev-btn" style="min-height: 34px; padding: 0.25rem 0.75rem; font-size: 0.8rem;">
          Previous
        </button>
        <span style="display: inline-flex; align-items: center; padding: 0 0.5rem; font-size: 0.85rem; font-weight: 600;">
          Page ${this.currentPage} of ${totalPages}
        </span>
        <button type="button" class="btn btn-secondary" ${this.currentPage === totalPages ? 'disabled' : ''} id="courses-next-btn" style="min-height: 34px; padding: 0.25rem 0.75rem; font-size: 0.8rem;">
          Next
        </button>
      </div>
    `;

    const prevBtn = pagContainer.querySelector('#courses-prev-btn');
    const nextBtn = pagContainer.querySelector('#courses-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.updateTable();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.updateTable();
        }
      });
    }
  }
}
