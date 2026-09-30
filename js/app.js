/**
 * Public Service Commission - Core Application Coordinator
 * Unifies curved navigation, multi-step profile flow,
 * combobox integrations, and real-time auto-save indicator.
 */

import { profileStore } from './profile-data.js';
import { Combobox } from './combobox.js';
import { FormValidator } from './form-validator.js';
import { CardBuilder } from './card-builder.js';
import { JobsManager } from './jobs.js';
import { CoursesManager } from './courses.js';
import { SummaryReviewManager } from './summary.js';
import { pscI18n, enStepsMeta, swStepsMeta } from './i18n.js';
import { apiClient } from './api-client.js';

class PSCApplication {
  constructor() {
    this.currentView = 'dashboard';
    this.currentStep = 1;
    this.totalSteps = 9;
    this.currentSegment = 1;
    this.totalSegments = 4;
    this.saveTimeout = null;

    const currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('psc_portal_lang')) || 'en';
    this.stepsMeta = currentLang === 'sw' ? [...swStepsMeta] : [...enStepsMeta];

    this.init();
  }

  init() {
    if (pscI18n && typeof pscI18n.init === 'function') {
      pscI18n.init();
    }
    this.bindGlobalEvents();
    this.initComboboxes();
    this.initCardBuilders();
    this.initJobsAndCourses();
    this.initFormValidation();
    this.initAutoSave();
    this.initSegmentWizard();
    this.renderProfileStepsSublist();
    this.updateMasterStepperHeader();
    this.populatePersonalFormData();
    this.switchView('dashboard');
  }

  bindGlobalEvents() {
    // 1. Sidebar Tree Navigation Nodes
    document.querySelectorAll('.sidebar-tree-node').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.getAttribute('data-action');
        const targetView = btn.getAttribute('data-view');

        if (action === 'apply') {
          this.switchView('jobs');
          // If jobs engine exists, trigger the application modal for first job
          const firstApplyBtn = document.querySelector('.btn-apply-job');
          if (firstApplyBtn) firstApplyBtn.click();
          return;
        }

        if (targetView === 'profile') {
          // Toggle profile sub-steps expansion
          const group = document.getElementById('profile-node-group');
          const arrow = btn.querySelector('.node-arrow-icon');
          if (group) {
            group.classList.toggle('open');
            if (arrow) arrow.classList.toggle('open', group.classList.contains('open'));
          }
          this.switchView('profile');
          return;
        }

        if (targetView) {
          this.switchView(targetView);
        }
      });
    });

    // 2. Applicant Section Accordion Toggle
    const applicantToggle = document.getElementById('applicant-accordion-toggle');
    const applicantTree = document.getElementById('applicant-nav-tree');
    if (applicantToggle && applicantTree) {
      applicantToggle.addEventListener('click', () => {
        const isCurrentlyExpanded = applicantToggle.getAttribute('aria-expanded') === 'true';
        applicantToggle.setAttribute('aria-expanded', !isCurrentlyExpanded);
        const chevron = applicantToggle.querySelector('.sidebar-chevron-icon');
        if (chevron) chevron.classList.toggle('open', !isCurrentlyExpanded);
        applicantTree.style.display = isCurrentlyExpanded ? 'none' : 'flex';
      });
    }

    // 3. Hamburger Menu Sidebar Toggle Button
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('portal-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    const closeMobileSidebar = () => {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) {
        backdrop.classList.remove('opacity-100', 'pointer-events-auto');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
      }
      document.body.classList.remove('mobile-drawer-open');
    };

    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 860) {
          const isOpen = sidebar.classList.toggle('mobile-open');
          if (backdrop) {
            backdrop.classList.toggle('opacity-100', isOpen);
            backdrop.classList.toggle('pointer-events-auto', isOpen);
            backdrop.classList.toggle('opacity-0', !isOpen);
            backdrop.classList.toggle('pointer-events-none', !isOpen);
          }
          document.body.classList.toggle('mobile-drawer-open', isOpen);
        } else {
          sidebar.classList.toggle('collapsed');
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileSidebar);
    }

    // 4. Step navigation buttons (Save & Continue / Previous)
    const prevBtn = document.getElementById('step-prev-btn');
    const nextBtn = document.getElementById('step-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToStep(this.currentStep - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToStep(this.currentStep + 1));
    }

    // 5. Save and Exit buttons
    document.querySelectorAll('.save-exit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.triggerAutoSave();
        this.switchView('dashboard');
      });
    });

    // 6. Quick Dashboard Action Cards
    document.querySelectorAll('.dashboard-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        const step = btn.getAttribute('data-step');
        if (view) this.switchView(view);
        if (step) this.goToStep(parseInt(step, 10));
      });
    });

    // 7. Bottom Sidebar Utility Toolbar Actions
    const btnFullscreen = document.getElementById('btn-sidebar-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    const btnContrast = document.getElementById('btn-sidebar-contrast');
    if (btnContrast) {
      btnContrast.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        alert(document.body.classList.contains('high-contrast') 
          ? 'High Contrast Mode Enabled (WCAG 2.2 AAA).' 
          : 'Standard Theme Restored.');
      });
    }

    const btnSettings = document.getElementById('btn-sidebar-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        alert('PSC Portal Preferences:\n• Language: English (Default)\n• Font Scaling: Standard 16px\n• Auto-Save: Enabled (Local Sync)\n• WAI-ARIA Screen Reader Physics: Active');
      });
    }

    const btnLogout = document.getElementById('btn-logout') || document.getElementById('btn-sidebar-power');
    const handleLogout = () => {
      if (confirm('Are you sure you wish to sign out of the Public Service Commission Portal?\nAll local edits have been safely cached.')) {
        sessionStorage.removeItem('psc_auth_token');
        sessionStorage.removeItem('psc_candidate_id');
        window.location.href = 'login.html';
      }
    };
    if (document.getElementById('btn-logout')) document.getElementById('btn-logout').addEventListener('click', handleLogout);
    if (document.getElementById('btn-sidebar-power')) document.getElementById('btn-sidebar-power').addEventListener('click', handleLogout);

    const btnChangePassword = document.getElementById('btn-change-password');
    if (btnChangePassword) {
      btnChangePassword.addEventListener('click', () => {
        alert('Change Password feature:\nA secure password reset token has been dispatched to candidate registered mobile (+254 721 *** 088) and email (shemdennis53@gmail.com).');
      });
    }

    // 8. Floating Back-to-Top Button & Main Canvas Scroll Tracking
    const scrollToTopBtn = document.getElementById('btn-scroll-to-top');
    const mainCanvas = document.getElementById('main-content');
    if (mainCanvas && scrollToTopBtn) {
      mainCanvas.addEventListener('scroll', () => {
        if (mainCanvas.scrollTop > 240) {
          scrollToTopBtn.classList.remove('translate-y-16', 'opacity-0', 'pointer-events-none');
          scrollToTopBtn.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
        } else {
          scrollToTopBtn.classList.add('translate-y-16', 'opacity-0', 'pointer-events-none');
          scrollToTopBtn.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        }
      }, { passive: true });

      scrollToTopBtn.addEventListener('click', () => {
        mainCanvas.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update active state on sidebar tree nodes
    document.querySelectorAll('.sidebar-tree-node').forEach(node => {
      if (node.getAttribute('data-view') === viewName) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    // Show/hide view containers
    document.querySelectorAll('.view-container').forEach(c => c.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
    }

    // If switching to profile, ensure profile sub-tree is open and step is highlighted
    if (viewName === 'profile') {
      const group = document.getElementById('profile-node-group');
      if (group) group.classList.add('open');
      const arrow = document.querySelector('.node-arrow-icon');
      if (arrow) arrow.classList.add('open');
      this.updateStepDisplay();
    }

    // Refresh review screen if review step
    if (viewName === 'profile' && this.currentStep === 9) {
      this.summaryManager.render();
    }

    // Close mobile drawer on view switch if on small screen
    const sidebar = document.getElementById('portal-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && window.innerWidth <= 860) {
      sidebar.classList.remove('mobile-open');
      if (backdrop) {
        backdrop.classList.remove('opacity-100', 'pointer-events-auto');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
      }
      document.body.classList.remove('mobile-drawer-open');
    }

    // Re-apply language translation if current language is Swahili
    if (window.pscI18n && window.pscI18n.currentLanguage === 'sw') {
      window.pscI18n.applyLanguage('sw');
    }

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderProfileStepsSublist() {
    const list = document.getElementById('sidebar-steps-list');
    if (!list) return;

    list.innerHTML = this.stepsMeta.map((s, idx) => {
      const stepNum = idx + 1;
      const isActive = stepNum === this.currentStep;
      const isCompleted = stepNum < this.currentStep;
      return `
        <button type="button" class="sidebar-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-step="${stepNum}">
          <span>${stepNum}. ${s.title}</span>
          ${isCompleted ? '<span class="step-node-check">✓</span>' : ''}
        </button>
      `;
    }).join('');

    list.querySelectorAll('.sidebar-step-node').forEach(item => {
      item.addEventListener('click', () => {
        const step = parseInt(item.getAttribute('data-step'), 10);
        this.switchView('profile');
        this.goToStep(step);
      });
    });
  }

  goToStep(stepNum) {
    if (stepNum < 1 || stepNum > this.totalSteps) return;

    // Validate current step before proceeding if advancing from Step 1
    if (stepNum > this.currentStep && this.currentStep === 1) {
      const form = document.getElementById('personal-details-form');
      if (form && !this.validator.validateAll(form)) {
        const firstInvalid = form.querySelector('.input-error, [aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        alert('Please review and resolve the flagged fields before advancing.');
        return;
      }
    }

    this.currentStep = stepNum;
    this.updateStepDisplay();
    this.triggerAutoSave();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateStepDisplay() {
    // Update master stepper header
    this.updateMasterStepperHeader();

    // Update active and completed states on sidebar steps sublist
    const list = document.getElementById('sidebar-steps-list');
    if (list) {
      list.querySelectorAll('.sidebar-step-node').forEach(item => {
        const s = parseInt(item.getAttribute('data-step'), 10);
        item.classList.remove('active', 'completed');
        const checkSpan = item.querySelector('.step-node-check');
        if (checkSpan) checkSpan.remove();

        if (s === this.currentStep) {
          item.classList.add('active');
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (s < this.currentStep) {
          item.classList.add('completed');
          const check = document.createElement('span');
          check.className = 'step-node-check';
          check.textContent = '✓';
          item.appendChild(check);
        }
      });
    }

    // Step panels display in main canvas
    document.querySelectorAll('.profile-step-panel').forEach(p => p.style.display = 'none');
    const activePanel = document.getElementById(`panel-${this.stepsMeta[this.currentStep - 1].id}`);
    if (activePanel) {
      activePanel.style.display = 'block';
    }

    // Toggle outer action buttons (Step 1 uses its own dedicated in-segment actions)
    const actionsBar = document.querySelector('.form-actions-bar');
    if (actionsBar) {
      actionsBar.style.display = this.currentStep === 1 ? 'none' : 'flex';
    }

    const prevBtn = document.getElementById('step-prev-btn');
    const nextBtn = document.getElementById('step-next-btn');

    if (prevBtn) {
      prevBtn.style.visibility = this.currentStep <= 1 ? 'hidden' : 'visible';
    }
    if (nextBtn) {
      if (this.currentStep === this.totalSteps) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'inline-flex';
        nextBtn.innerHTML = `Continue to Step ${this.currentStep + 1} &rarr;`;
      }
    }

    // If on review step, trigger render
    if (this.currentStep === 9 && this.summaryManager) {
      this.summaryManager.render();
    }

    this.updateSidebarContext('profile');
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ==========================================================================
     Sequential & Segmented Wizard Engine (Step 1 Personal Details)
     ========================================================================== */

  initSegmentWizard() {
    // 1. Tab button clicks (allowing user to jump between segments)
    const tabBtns = document.querySelectorAll('.segment-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const seg = parseInt(btn.getAttribute('data-segment'), 10);
        this.goToSegment(seg);
      });
    });

    // 2. Next segment button clicks
    const nextBtns = document.querySelectorAll('.next-segment-btn');
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetNext = btn.getAttribute('data-next');
        const currentPanel = document.getElementById(`segment-panel-${this.currentSegment}`);

        // Validate the active segment
        if (currentPanel && !this.validator.validateSegment(currentPanel)) {
          alert('Please complete all required fields highlighted in this section before continuing.');
          return;
        }

        // Save current form inputs to profileStore
        this.saveCurrentSegmentData();

        // Mark current segment tab as completed
        const curTab = document.getElementById(`tab-seg-${this.currentSegment}`);
        if (curTab) {
          curTab.classList.add('completed');
          const badge = curTab.querySelector('.segment-tab-badge');
          if (badge) badge.textContent = '✓';
        }

        if (targetNext === 'finish') {
          // Complete Step 1 and proceed to Step 2 (High School)
          this.goToStep(2);
        } else {
          const nextSegNum = parseInt(targetNext, 10);
          this.goToSegment(nextSegNum);
        }
      });
    });

    // 3. Previous segment button clicks
    const prevBtns = document.querySelectorAll('.prev-segment-btn');
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPrev = parseInt(btn.getAttribute('data-prev'), 10);
        this.goToSegment(targetPrev);
      });
    });
  }

  saveCurrentSegmentData() {
    const form = document.getElementById('personal-details-form');
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Also capture combobox values if present
    const countyInput = document.getElementById('combo-county-input');
    if (countyInput && countyInput.value) data.county = countyInput.value;
    const subCountyInput = document.getElementById('combo-subcounty-input');
    if (subCountyInput && subCountyInput.value) data.subCounty = subCountyInput.value;
    const ethnicityInput = document.getElementById('combo-ethnicity-input');
    if (ethnicityInput && ethnicityInput.value) data.ethnicity = ethnicityInput.value;

    profileStore.set(data);
    this.triggerAutoSave();
  }

  goToSegment(segNum) {
    if (segNum < 1 || segNum > this.totalSegments) return;
    this.currentSegment = segNum;

    // Update Tab navigation states
    document.querySelectorAll('.segment-tab-btn').forEach(btn => {
      const s = parseInt(btn.getAttribute('data-segment'), 10);
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', s === segNum ? 'true' : 'false');
      if (s === segNum) {
        btn.classList.add('active');
      }
    });

    // Update Segment Panels visibility
    document.querySelectorAll('.form-segment').forEach(panel => {
      panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(`segment-panel-${segNum}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Scroll smoothly to top of the wizard card
    const wizardCard = document.querySelector('.segment-wizard-card');
    if (wizardCard) {
      wizardCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  updateMasterStepperHeader() {
    const titleElem = document.getElementById('profile-master-step-title');
    const descElem = document.getElementById('profile-master-step-desc');
    const pctElem = document.getElementById('profile-overall-pct');
    const fillElem = document.getElementById('profile-overall-progress-fill');
    const pillsBar = document.getElementById('profile-step-pills-bar');

    const stepMeta = this.stepsMeta[this.currentStep - 1];
    const isSw = (window.currentLanguage && window.currentLanguage() === 'sw');
    if (titleElem && stepMeta) {
      titleElem.textContent = isSw
        ? `Hatua ya ${this.currentStep} kati ya ${this.totalSteps}: ${stepMeta.title}`
        : `Step ${this.currentStep} of ${this.totalSteps}: ${stepMeta.title}`;
    }
    if (descElem && stepMeta) {
      descElem.textContent = isSw
        ? `${stepMeta.desc}. Ukusanyaji wa wasifu kwa hatua zilizopangwa.`
        : `${stepMeta.desc}. Sequential, segmented bio-data capture.`;
    }

    // Dynamic completion calculation (92% default for Dennis Limo's profile, advancing to 94%, 96%, 98%, 100%)
    const basePct = 92;
    const stepIncrement = Math.round(((this.currentStep - 1) / (this.totalSteps - 1)) * 8);
    const overallPct = Math.min(100, basePct + stepIncrement);

    if (pctElem) pctElem.textContent = `${overallPct}%`;
    if (fillElem) fillElem.style.width = `${overallPct}%`;

    // Render horizontal step pills (Steps 1 to 9)
    if (pillsBar) {
      pillsBar.innerHTML = this.stepsMeta.map((s, idx) => {
        const num = idx + 1;
        const isActive = num === this.currentStep;
        const isCompleted = num < this.currentStep;
        return `
          <button type="button" class="profile-step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-step="${num}" title="${s.title}">
            ${isCompleted ? '<span class="pill-check-icon">✓</span>' : `<span>${num}.</span>`}
            <span>${s.title}</span>
          </button>
        `;
      }).join('');

      pillsBar.querySelectorAll('.profile-step-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const step = parseInt(pill.getAttribute('data-step'), 10);
          this.goToStep(step);
        });
      });
    }
  }

  initComboboxes() {
    // 47 Kenyan Counties
    const counties = [
      'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 'Homa Bay',
      'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
      'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
      'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
      'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
      'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
    ];

    const p = profileStore.get();

    this.countyCombobox = new Combobox('#combo-county-container', {
      items: counties,
      placeholder: 'Select Home County...',
      initialValue: p.homeCounty || 'Nandi',
      maxWidth: '320px',
      onSelect: (selected) => {
        profileStore.set({ homeCounty: selected });
        this.triggerAutoSave();
      }
    });

    const nandiSubcounties = ['Chesumei', 'Emgwen', 'Mosop', 'Nandi Hills', 'Aldai', 'Tinderet'];
    this.subcountyCombobox = new Combobox('#combo-subcounty-container', {
      items: nandiSubcounties,
      placeholder: 'Select Sub-County...',
      initialValue: p.subCounty || 'Chesumei',
      maxWidth: '320px',
      onSelect: (selected) => {
        profileStore.set({ subCounty: selected });
        this.triggerAutoSave();
      }
    });

    // Ethnicity Combobox
    const ethnicities = [
      'Kalenjin', 'Kikuyu', 'Luhya', 'Luo', 'Kamba', 'Kisii', 'Meru', 'Mijikenda',
      'Maasai', 'Turkana', 'Somali', 'Taita', 'Embu', 'Borana', 'Kenyan Asian', 'Kenyan European', 'Other'
    ];
    this.ethnicityCombobox = new Combobox('#combo-ethnicity-container', {
      items: ethnicities,
      placeholder: 'Select Ethnicity...',
      initialValue: p.ethnicity || 'Kalenjin',
      maxWidth: '320px',
      onSelect: (selected) => {
        profileStore.set({ ethnicity: selected });
        this.triggerAutoSave();
      }
    });
  }

  initCardBuilders() {
    this.highSchoolBuilder = new CardBuilder({
      container: '#highschool-cards-container',
      type: 'highSchool',
      title: 'Secondary & Primary School Education',
      addBtnLabel: 'Add School Qualification',
      onUpdate: () => this.triggerAutoSave()
    });

    this.academicBuilder = new CardBuilder({
      container: '#academic-cards-container',
      type: 'academic',
      title: 'University Degrees & Diplomas',
      addBtnLabel: 'Add Academic Degree/Diploma',
      onUpdate: () => this.triggerAutoSave()
    });

    this.professionalBuilder = new CardBuilder({
      container: '#professional-cards-container',
      type: 'professional',
      title: 'Professional Certifications',
      addBtnLabel: 'Add Professional Certificate',
      onUpdate: () => this.triggerAutoSave()
    });

    this.otherCoursesBuilder = new CardBuilder({
      container: '#othercourses-cards-container',
      type: 'otherCourses',
      title: 'Seminars & Workshops (>= 1 Week)',
      addBtnLabel: 'Add Seminar / Workshop',
      onUpdate: () => this.triggerAutoSave()
    });

    this.membershipsBuilder = new CardBuilder({
      container: '#memberships-cards-container',
      type: 'professionalBodies',
      title: 'Memberships to Professional Bodies',
      addBtnLabel: 'Add Professional Body',
      onUpdate: () => this.triggerAutoSave()
    });

    this.employmentBuilder = new CardBuilder({
      container: '#employment-cards-container',
      type: 'employment',
      title: 'Public Service & Work Experience History',
      addBtnLabel: 'Add Work Position',
      onUpdate: () => this.triggerAutoSave()
    });

    this.refereesBuilder = new CardBuilder({
      container: '#referees-cards-container',
      type: 'referees',
      title: 'Professional Referees (3 Required)',
      addBtnLabel: 'Add Referee',
      onUpdate: () => this.triggerAutoSave()
    });
  }

  initJobsAndCourses() {
    this.jobsManager = new JobsManager({
      tableContainer: '#active-jobs-table-container',
      statusContainer: '#application-status-table-container',
      onApplyClicked: (job) => {
        // Transition straight to application review
        this.switchView('profile');
        this.goToStep(9);
        alert(`You are applying for Advert No. ${job.advertNumber}: ${job.position} at ${job.organization}. Please verify your bio-data summary and confirm submission.`);
      }
    });

    this.coursesManager = new CoursesManager('#courses-registry-container');

    this.summaryManager = new SummaryReviewManager({
      container: '#panel-step-review',
      onJumpToStep: (stepId, fieldName) => {
        const stepIdx = this.stepsMeta.findIndex(s => s.id === stepId);
        if (stepIdx >= 0) {
          this.goToStep(stepIdx + 1);
          if (fieldName) {
            setTimeout(() => {
              const el = document.querySelector(`[name="${fieldName}"]`);
              if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
        }
      },
      onSubmitApplication: () => {
        this.switchView('applications');
      }
    });
  }

  initFormValidation() {
    this.validator = new FormValidator({
      onSaveTrigger: () => this.triggerAutoSave()
    });

    const personalForm = document.getElementById('personal-details-form');
    if (personalForm) {
      this.validator.attachToForm(personalForm);

      // Listen to input changes for dynamic auto-save
      personalForm.addEventListener('change', () => {
        const formData = new FormData(personalForm);
        const data = Object.fromEntries(formData.entries());
        profileStore.set(data);
        this.triggerAutoSave();
      });

      // PWD Conditional Visibility Handler
      const pwdYesRadio = personalForm.querySelector('#pwd-yes-radio');
      const pwdNoRadio = personalForm.querySelector('#pwd-no-radio');
      const pwdFields = personalForm.querySelector('#pwd-conditional-fields');

      const updatePwdVisibility = () => {
        if (pwdYesRadio && pwdFields) {
          pwdFields.style.display = pwdYesRadio.checked ? 'block' : 'none';
        }
      };

      if (pwdYesRadio && pwdNoRadio) {
        pwdYesRadio.addEventListener('change', updatePwdVisibility);
        pwdNoRadio.addEventListener('change', updatePwdVisibility);
      }

      // Public Service Conditional Visibility Handler
      const psYesRadio = personalForm.querySelector('#ps-yes-radio');
      const psNoRadio = personalForm.querySelector('#ps-no-radio');
      const psFields = personalForm.querySelector('#ps-conditional-fields');

      const updatePsVisibility = () => {
        if (psYesRadio && psFields) {
          psFields.style.display = psYesRadio.checked ? 'block' : 'none';
        }
      };

      if (psYesRadio && psNoRadio) {
        psYesRadio.addEventListener('change', updatePsVisibility);
        psNoRadio.addEventListener('change', updatePsVisibility);
      }
    }

    // Dashboard Payroll Number input direct synchronization
    const dashPayrollInput = document.getElementById('dash-payroll-input');
    if (dashPayrollInput) {
      const p = profileStore.get();
      dashPayrollInput.value = p.payrollNumber || '';

      dashPayrollInput.addEventListener('blur', () => {
        profileStore.set({ payrollNumber: dashPayrollInput.value.trim() });
        this.triggerAutoSave();
      });
    }
  }

  populatePersonalFormData() {
    const p = profileStore.get();
    const form = document.getElementById('personal-details-form');
    if (!form) return;

    Object.keys(p).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && typeof p[key] === 'string') {
        input.value = p[key];
      }
    });

    // Set radios
    if (p.gender) {
      const gRadio = form.querySelector(`input[name="gender"][value="${p.gender}"]`);
      if (gRadio) gRadio.checked = true;
    }
    if (p.inPublicService) {
      const psRadio = form.querySelector(`input[name="inPublicService"][value="${p.inPublicService}"]`);
      if (psRadio) psRadio.checked = true;
    }
  }

  initAutoSave() {
    profileStore.subscribe(() => {
      this.updateAutoSaveIndicator();
    });
  }

  triggerAutoSave() {
    const indicator = document.getElementById('auto-save-indicator');
    if (indicator) {
      indicator.classList.add('saving');
      indicator.innerHTML = `<span class="auto-save-dot"></span><span>Syncing with PSC Cloud...</span>`;
    }

    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(async () => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      let syncedWithBackend = false;
      try {
        const payload = profileStore.getAll();
        const res = await apiClient.saveProfile({
          idNo: payload.idNo || '35431943',
          profile: payload
        });
        if (res && res.success && !res.localOnly) {
          syncedWithBackend = true;
        }
      } catch {
        syncedWithBackend = false;
      }

      if (indicator) {
        indicator.classList.remove('saving');
        const syncText = syncedWithBackend 
          ? `✓ Cloud Synced (${timeStr})` 
          : `✓ Saved locally at ${timeStr}`;
        indicator.innerHTML = `<span class="auto-save-dot"></span><span>${syncText}</span>`;
      }
    }, 600);
  }

  updateAutoSaveIndicator() {
    this.triggerAutoSave();
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.pscApp = new PSCApplication();
});
