import { browser, ExpectedConditions as EC, $, $$ } from 'protractor'
import * as support from './support'

export abstract class BasePage {
  protected url: string = '' // Will be same as baseUrl by default.

  constructor(url?: string) {
    this.url = url || ''
  }

  async open() {
		await browser.get(this.url)
  }

}

export class HomePage extends BasePage {
  login = $('#login')

  constructor(url: string) {
    super(url)
  }
}

//section > div > div.progress-description > div<Paste>

export class LoginPage extends BasePage {
  usernameInput = $('#username')
  passwordInput = $('#password')
  loginButton = $('#kc-login')

  async login(username: string, password : string) {
    await expect(this.usernameInput).toAppear('Username input must be present')
    await expect(this.passwordInput).toAppear('Password input must be present')
    await expect(this.loginButton).toAppear('Password input must be present')

    await this.usernameInput.sendKeys(username)
    await this.passwordInput.sendKeys(password)
    await this.loginButton.click()
  }
}

// packaging
// typescript
// contract of who creates teh pgObject model
//

declare let expect:any

describe('HomePage', ()=> {
  let homePage: HomePage;

  beforeEach( async (): Promise<any> => {
    support.desktopTestSetup()
		homePage = new HomePage(browser.params.target.url)
    await homePage.open()
  })

  it('shows the title', async ()=> {
    await expect(browser.getTitle()).toEqual('OpenShift.io')
  })

  it('show login button', async ()=>{
		browser.ignoreSynchronization = true
    await expect($$('div').first()).toAppear('Atleast one div should appear on the page')
    await expect( homePage.login).toAppear('Login must be present')
  })

  it('can login using correct username and password', async ()=>{
    await homePage.login.click()

    let loginPage = new LoginPage()
    await loginPage.login(browser.params.login.user, browser.params.login.password)
  })
})
