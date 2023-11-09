import { knownMultisigs } from '../fixtures/knownMultisigs'
import { landingPageAddressUrl, landingPageUrl } from '../fixtures/landingData'
import { InjectedAccountWitMnemonic, testAccounts } from '../fixtures/testAccounts'
import { watchMultisigs } from '../fixtures/watchAccounts/watchMultisigs'
import { watchSignatories } from '../fixtures/watchAccounts/watchSignatories'
import { accountDisplay } from '../support/page-objects/components/accountDisplay'
import { landingPage } from '../support/page-objects/landingPage'
import { multisigPage } from '../support/page-objects/multisigPage'
import { topMenuItems } from '../support/page-objects/topMenuItems'
import { clickOnConnect } from '../utils/clickOnConnect'

const initConnectAndRefreshWithAddress = (
  initAccounts: InjectedAccountWitMnemonic[],
  connectedAddresses: string[],
  addressUrl?: string
) => {
  cy.visit(landingPageUrl)
  cy.initExtension(Object.values(initAccounts))
  clickOnConnect()
  cy.connectAccounts(connectedAddresses)

  //refresh the page now that the extension is allowed to connect
  cy.visitWithInjectedExtension(addressUrl ? landingPageAddressUrl(addressUrl) : landingPageUrl)
}

describe('Account address in the address bar', () => {
  it('shows multi and update address with 1 watched (multi), 0 connected account, no linked address', () => {
    const { address, publicKey } = watchMultisigs['multisig-without-pure']

    // we have a watched account that is a multisig
    cy.visitWithLocalStorage({
      // any account
      url: landingPageUrl,
      watchedAccounts: [publicKey]
    })

    cy.url({ timeout: 10000 }).should('include', address)
    topMenuItems.multiproxySelectorInput().should('have.value', address)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', address.slice(0, 6))
    })
  })

  it('shows multi and update address with 0 watched, 1 connected account (multi), no linked address', () => {
    const { address } = knownMultisigs['test-multisig-1']

    initConnectAndRefreshWithAddress(
      [testAccounts['Multisig Member Account 1']],
      [testAccounts['Multisig Member Account 1'].address],
      undefined
    )

    cy.url({ timeout: 10000 }).should('include', address)
    topMenuItems.multiproxySelectorInput().should('have.value', address)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', address.slice(0, 6))
    })
  })

  it('shows an error with 0 watched, 0 connected account, unknown linked address', () => {
    cy.visit(landingPageAddressUrl(testAccounts['Non Multisig Member 1'].address))
    landingPage.linkedAddressNotFound().should('contain.text', "The linked address can't be found")
    topMenuItems.multiproxySelector().should('not.exist')
  })

  it('shows an error and can reset with 1 watched (multi), 0 connected account, unknown linked address', () => {
    const { publicKey, address: multisigAddress } = watchMultisigs['multisig-without-pure']

    // we have a watched account that is a multisig
    cy.visitWithLocalStorage({
      // any account
      url: landingPageAddressUrl(testAccounts['Non Multisig Member 1'].address),
      watchedAccounts: [publicKey]
    })

    landingPage.linkedAddressNotFound().should('contain.text', "The linked address can't be found")
    cy.url().should('include', testAccounts['Non Multisig Member 1'].address)
    topMenuItems.multiproxySelector().should('be.visible')
    topMenuItems.multiproxySelectorInput().should('have.value', '')

    // click reset leads to the multisig
    landingPage.resetLinkedAddressButton().click()
    cy.url().should('not.include', testAccounts['Non Multisig Member 1'].address)
    cy.url().should('include', multisigAddress)
    topMenuItems.multiproxySelectorInput().should('have.value', multisigAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', multisigAddress.slice(0, 6))
    })
  })

  it('shows an error and can reset with 1 watched (pure), 0 connected account, unknown linked address', () => {
    const { purePublicKey, pureAddress } = watchMultisigs['multisig-with-pure']

    // we have a watched account that is a pure
    cy.visitWithLocalStorage({
      // unknown account in the url
      url: landingPageAddressUrl(testAccounts['Non Multisig Member 1'].address),
      watchedAccounts: [purePublicKey]
    })
    landingPage.linkedAddressNotFound().should('contain.text', "The linked address can't be found")
    cy.url().should('include', testAccounts['Non Multisig Member 1'].address)
    topMenuItems.multiproxySelector().should('be.visible')
    topMenuItems.multiproxySelectorInput().should('have.value', '')

    // click reset leads to the pure
    landingPage.resetLinkedAddressButton().click()
    cy.url().should('not.include', testAccounts['Non Multisig Member 1'].address)
    cy.url().should('include', pureAddress)
    topMenuItems.multiproxySelectorInput().should('have.value', pureAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', pureAddress.slice(0, 6))
    })
  })

  it('shows an error and can reset with 0 watched, 1 connected account (multi), unknown linked address', () => {
    const { address } = knownMultisigs['test-multisig-1']
    const nonMulitisigAccountAddress = testAccounts['Non Multisig Member 1'].address

    initConnectAndRefreshWithAddress(
      [testAccounts['Multisig Member Account 1']],
      [testAccounts['Multisig Member Account 1'].address],
      nonMulitisigAccountAddress
    )
    landingPage.linkedAddressNotFound().should('contain.text', "The linked address can't be found")
    cy.url().should('include', nonMulitisigAccountAddress)
    topMenuItems.multiproxySelector().should('be.visible')
    topMenuItems.multiproxySelectorInput().should('have.value', '')

    // click reset leads to the multi
    landingPage.resetLinkedAddressButton().click()
    cy.url().should('not.include', nonMulitisigAccountAddress)
    cy.url().should('include', address)
    topMenuItems.multiproxySelectorInput().should('have.value', address)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', address.slice(0, 6))
    })
  })

  it('shows the pure with 1 watched (pure), 0 connected account, pure linked address', () => {
    const { purePublicKey, pureAddress } = watchMultisigs['multisig-with-pure']

    // we have a watched account that is a pure
    cy.visitWithLocalStorage({
      url: landingPageAddressUrl(pureAddress),
      watchedAccounts: [purePublicKey]
    })

    cy.url().should('include', pureAddress)
    topMenuItems.multiproxySelectorInput().should('have.value', pureAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', pureAddress.slice(0, 6))
    })
  })

  it('shows the pure with 1 watched (multi), 0 connected account, pure linked address', () => {
    const { publicKey, pureAddress } = watchMultisigs['multisig-with-pure']

    // we have a watched account that is a pure
    cy.visitWithLocalStorage({
      url: landingPageAddressUrl(pureAddress),
      // here is the difference compared to previous test
      watchedAccounts: [publicKey]
    })

    cy.url().should('include', pureAddress)
    topMenuItems.multiproxySelectorInput().should('have.value', pureAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', pureAddress.slice(0, 6))
    })
  })

  it('shows the pure with 1 watched (signatory pure), 0 connected account, pure linked address', () => {
    const { pureAddress } = watchMultisigs['multisig-with-pure']
    const { publickey: signatoryPublicKey } = watchSignatories[0]

    // we have a watched account that is a pure
    cy.visitWithLocalStorage({
      url: landingPageAddressUrl(pureAddress),
      // here is the difference compared to previous test
      watchedAccounts: [signatoryPublicKey!]
    })

    cy.url().should('include', pureAddress)
    topMenuItems.multiproxySelectorInput().should('have.value', pureAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', pureAddress.slice(0, 6))
    })
  })

  it('shows a pure with 0 watched, 1 connected account (many multi & pure), pure linked address', () => {
    const expectedPureAddress = '5EXePPDNnucmLgrirMPQatFfu4WjncVbVoDZXx1gq75e3JcF'
    initConnectAndRefreshWithAddress(
      [testAccounts['Many Multisig And Pure Member 1']],
      [testAccounts['Many Multisig And Pure Member 1'].address],
      expectedPureAddress
    )
    cy.url().should('include', expectedPureAddress)
    topMenuItems.multiproxySelectorInput().should('have.value', expectedPureAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', expectedPureAddress.slice(0, 6))
    })
  })

  it('shows a multi with 0 watched, 1 connected account (many multi & pure), multi linked address', () => {
    const expectedMultiAddress = '5DxNgjvfJLfDTAAgFD1kWtJAh2KVNTTkwytr7S37dZwVpXd7'
    initConnectAndRefreshWithAddress(
      [testAccounts['Many Multisig And Pure Member 1']],
      [testAccounts['Many Multisig And Pure Member 1'].address],
      expectedMultiAddress
    )
    cy.url().should('include', expectedMultiAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', expectedMultiAddress.slice(0, 6))
    })
    topMenuItems.multiproxySelectorInput().should('have.value', expectedMultiAddress)
  })

  it('switching accounts changes the address in the address bar', () => {
    const expectedPureAddress = '5EXePPDNnucmLgrirMPQatFfu4WjncVbVoDZXx1gq75e3JcF'
    const multiAddress = '5DxNgjvfJLfDTAAgFD1kWtJAh2KVNTTkwytr7S37dZwVpXd7'
    const first6Letters = multiAddress.slice(0, 6)

    cy.visitWithLocalStorage({
      url: landingPageAddressUrl(expectedPureAddress),
      watchedAccounts: [testAccounts['Many Multisig And Pure Member 1'].publicKey!]
    })

    // check that there is the pure address in the address bar
    cy.url().should('include', expectedPureAddress)
    topMenuItems
      .desktopMenu()
      .within(() =>
        topMenuItems.multiproxySelector().click().type(`${first6Letters}{downArrow}{enter}`)
      )
    cy.url().should('include', multiAddress)
    multisigPage.accountHeader().within(() => {
      accountDisplay.addressLabel().should('contain.text', multiAddress.slice(0, 6))
    })
  })

  it('switching networks resets address in the address bar', () => {
    const { address, publicKey } = watchMultisigs['multisig-without-pure']

    // we have a watched account that is a multisig
    cy.visitWithLocalStorage({
      // any account
      url: landingPageUrl,
      watchedAccounts: [publicKey]
    })

    // check that there is an address in the address bar
    cy.url().should('include', address)

    topMenuItems.desktopMenu().within(() => topMenuItems.networkSelector().click())
    topMenuItems.networkSelectorOption('kusama').click()
    cy.url().should('not.include', 'address=')
  })

  it('navigating to home, settings, about, overview does not change the address bar', () => {
    const { address, publicKey } = watchMultisigs['multisig-without-pure']

    // we have a watched account that is a multisig
    cy.visitWithLocalStorage({
      // any account
      url: landingPageUrl,
      watchedAccounts: [publicKey]
    })

    // check that there is an address in the address bar
    cy.url().should('include', address)

    topMenuItems.homeButton().click()
    cy.url().should('include', address)
    topMenuItems.settingsButton().click()
    cy.url().should('include', address)
    topMenuItems.overviewButton().click()
    cy.url().should('include', address)
    topMenuItems.aboutButton().click()
    cy.url().should('include', address)
  })
})