/**
 * The Risk Factor — End-to-End Cypress Test Suite
 * FIX: Updated button selectors to match actual UI labels
 * FIX: Changed .trigger('change') → .trigger('input') for React range inputs
 * FIX: Added proper beforeEach isolation and more complete assertions
 */
describe('The Risk Factor — Core E2E', () => {
  const BASE = 'http://localhost:5173'
  const API  = 'http://localhost:3001'

  beforeEach(() => {
    cy.viewport('macbook-15')
    cy.clearLocalStorage()
  })

  // ─── Auth: Login ─────────────────────────────────────────────
  describe('Login Flow', () => {
    it('TC-L01: Valid credentials → redirect to dashboard', () => {
      cy.visit(`${BASE}/login`)
      cy.get('input[type="email"]').type('admin@riskguard.com')
      cy.get('input[type="password"]').type('password123')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/dashboard')
      cy.contains('RISK COMMAND').should('be.visible')
    })

    it('TC-L02: Wrong password shows error', () => {
      cy.visit(`${BASE}/login`)
      cy.get('input[type="email"]').type('admin@riskguard.com')
      cy.get('input[type="password"]').type('WrongPass999!')
      cy.get('button[type="submit"]').click()
      cy.contains('Invalid email or password').should('be.visible')
      cy.url().should('include', '/login')
    })

    it('TC-L03: Empty submit shows validation errors', () => {
      cy.visit(`${BASE}/login`)
      cy.get('button[type="submit"]').click()
      cy.get('input[type="email"]').then($el => {
        expect($el[0].validationMessage).to.not.be.empty
      })
    })

    it('TC-L04: Already authenticated redirects to dashboard', () => {
      cy.window().then(win => {
        win.localStorage.setItem('auth_user', JSON.stringify({
          id: 'USR-1001', email: 'admin@riskguard.com',
          name: 'Admin User', role: 'analyst'
        }))
      })
      cy.visit(`${BASE}/login`)
      cy.url().should('include', '/dashboard')
    })

    it('TC-L05: Unauthenticated access to /dashboard redirects to /login', () => {
      cy.visit(`${BASE}/dashboard`)
      cy.url().should('include', '/login')
    })
  })

  // ─── Auth: Signup ─────────────────────────────────────────────
  describe('Signup Flow', () => {
    afterEach(() => {
      // Cleanup: remove test user created during signup tests
      cy.request('GET', `${API}/users`).then(res => {
        res.body
          .filter(u => u.email.includes('cypresstest'))
          .forEach(u => cy.request('DELETE', `${API}/users/${u.id}`))
      })
    })

    it('TC-R01: Valid signup creates account and logs in', () => {
      cy.visit(`${BASE}/signup`)
      cy.get('input[name="name"], #name').type('Cypress Tester')
      cy.get('input[type="email"]').type('cypresstest@example.com')
      cy.get('input[type="password"]').first().type('Test@1234')
      cy.get('input[type="password"]').last().type('Test@1234')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/dashboard')
    })

    it('TC-R03: Password mismatch shows error', () => {
      cy.visit(`${BASE}/signup`)
      cy.get('input[name="name"], #name').type('Cypress Tester')
      cy.get('input[type="email"]').type('cypresstest2@example.com')
      cy.get('input[type="password"]').first().type('Test@1234')
      cy.get('input[type="password"]').last().type('Different@5678')
      cy.get('button[type="submit"]').click()
      cy.contains('do not match').should('be.visible')
    })

    it('TC-R05: .in email domain is accepted (regression: was blocked)', () => {
      cy.visit(`${BASE}/signup`)
      cy.get('input[name="name"], #name').type('Indian User')
      cy.get('input[type="email"]').type('cypresstest@example.in')
      cy.get('input[type="password"]').first().type('Test@1234')
      cy.get('input[type="password"]').last().type('Test@1234')
      cy.get('button[type="submit"]').click()
      // Should NOT show TLD error
      cy.contains('Institutional email required').should('not.exist')
    })
  })

  // ─── Core Feature: Risk Assessment ──────────────────────────
  describe('Risk Assessment Flow', () => {
    beforeEach(() => {
      cy.window().then(win => {
        win.localStorage.setItem('auth_user', JSON.stringify({
          id: 'USR-1001', email: 'admin@riskguard.com',
          name: 'Admin User', role: 'analyst'
        }))
      })
    })

    afterEach(() => {
      // Cleanup: remove applicants created during tests
      cy.request('GET', `${API}/applicants`).then(res => {
        res.body
          .filter(a => a.name?.includes('Cypress'))
          .forEach(a => cy.request('DELETE', `${API}/applicants/${a.id}`))
      })
    })

    it('TC-E01: High-risk profile produces REJECT recommendation', () => {
      cy.visit(`${BASE}/evaluate`)
      cy.get('#app-name').type('Cypress High Risk')

      // FIX: Use .trigger('input') not .trigger('change') for React range inputs
      cy.get('#app-credit').invoke('val', 350).trigger('input')

      // FIX: Button says "run analysis" in UI — use partial match
      cy.get('button').contains(/run analysis/i).click()
      cy.contains(/computing/i, { timeout: 3000 }).should('not.exist')

      cy.contains(/reject/i, { timeout: 10000 }).should('be.visible')
    })

    it('TC-E02: Low-risk profile produces APPROVE recommendation', () => {
      cy.visit(`${BASE}/evaluate`)
      cy.get('#app-name').type('Cypress Low Risk')
      cy.get('#app-credit').invoke('val', 800).trigger('input')
      cy.get('#app-ltv').invoke('val', 0.5).trigger('input')
      cy.get('button').contains(/run analysis/i).click()
      cy.contains(/approve/i, { timeout: 10000 }).should('be.visible')
    })

    it('TC-E03: Save without name shows error toast', () => {
      cy.visit(`${BASE}/evaluate`)
      // Run analysis first (name is empty)
      cy.get('button').contains(/run analysis/i).click()
      cy.wait(2000)
      // Try to save without name
      cy.get('button').contains(/save application/i).click()
      cy.contains(/applicant name/i).should('be.visible')
    })

    it('TC-E04: Save with name → redirects to dashboard → name visible', () => {
      cy.visit(`${BASE}/evaluate`)
      cy.get('#app-name').type('Cypress Save Test')
      cy.get('button').contains(/run analysis/i).click()
      cy.wait(2000)
      cy.get('button').contains(/save application/i).click()
      cy.url().should('include', '/dashboard')
      cy.contains('Cypress Save Test').should('be.visible')
    })
  })

  // ─── Navigation ──────────────────────────────────────────────
  describe('Navigation & Structure', () => {
    beforeEach(() => {
      cy.window().then(win => {
        win.localStorage.setItem('auth_user', JSON.stringify({
          id: 'USR-1001', email: 'admin@riskguard.com',
          name: 'Admin User', role: 'analyst'
        }))
      })
    })

    it('TC-N01: All nav items navigate correctly', () => {
      cy.visit(`${BASE}/dashboard`)
      const routes = [
        { label: /assess/i,   path: '/evaluate' },
        { label: /heatmap/i,  path: '/heatmap'  },
        { label: /planner/i,  path: '/emi'      },
        { label: /compare/i,  path: '/compare'  },
        { label: /export/i,   path: '/export'   },
        { label: /overview/i, path: '/dashboard' },
      ]
      routes.forEach(({ label, path }) => {
        cy.get('nav').contains(label).click()
        cy.url().should('include', path)
      })
    })

    it('TC-N02: Compare page renders (not blank) with existing applicants', () => {
      cy.visit(`${BASE}/compare`)
      cy.get('body').should('not.be.empty')
      // Should show either the comparison UI or the "Insufficient Data" empty state
      cy.get('h1').should('be.visible')
    })

    it('TC-N03: 404 page renders for unknown routes', () => {
      cy.visit(`${BASE}/this-does-not-exist`)
      cy.contains('404').should('be.visible')
    })

    it('TC-N04: Logout clears session and redirects to login', () => {
      cy.visit(`${BASE}/dashboard`)
      // Open user menu
      cy.get('[data-cy="user-avatar"], button').contains('AD').click()
      cy.contains(/sign out|logout/i).click()
      cy.url().should('include', '/login')
      cy.window().its('localStorage').invoke('getItem', 'auth_user').should('be.null')
    })
  })

  // ─── API Validation ──────────────────────────────────────────
  describe('API Endpoint Tests', () => {
    it('TC-API01: GET /applicants returns array', () => {
      cy.request('GET', `${API}/applicants`).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body).to.be.an('array')
      })
    })

    it('TC-API02: GET /applicants/:id returns specific record', () => {
      cy.request('GET', `${API}/applicants/APP-9021`).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body).to.have.property('name')
        expect(res.body.id).to.eq('APP-9021')
      })
    })

    it('TC-API03: GET /auditLogs returns audit trail', () => {
      cy.request('GET', `${API}/auditLogs`).then(res => {
        expect(res.status).to.eq(200)
        expect(res.body).to.be.an('array')
      })
    })

    it('TC-API04: Invalid applicant ID returns 404', () => {
      cy.request({ url: `${API}/applicants/INVALID-999`, failOnStatusCode: false }).then(res => {
        expect(res.status).to.eq(404)
      })
    })
  })
})
