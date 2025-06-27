const { expect } = require('chai');
const sinon = require('sinon');
const { JSDOM } = require('jsdom');

// main.test.js

describe('main.js', function() {
  let window, document, modal, modalMessage, hearts, clock, mainJs, mimicServerCallStub;

  // Helper to load main.js after setting up DOM and global
  function loadMainJs() {
    delete require.cache[require.resolve('./main.js')];
    mainJs = require('./main.js');
  }

  beforeEach(function() {
    // Set up jsdom DOM
    const dom = new JSDOM(`
      <body>
        <div id="modal" class="hidden"><span id="modal-message"></span></div>
        <span class="like-glyph">♡</span>
        <span class="like-glyph">♡</span>
      </body>
    `, { url: "http://localhost" });
    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.HTMLElement = window.HTMLElement;

    // Fake timers
    clock = sinon.useFakeTimers();

    // Stub mimicServerCall globally
    mimicServerCallStub = sinon.stub();
    global.mimicServerCall = mimicServerCallStub;

    // Load main.js (it will use the stub and DOM)
    loadMainJs();

    modal = document.getElementById('modal');
    modalMessage = document.getElementById('modal-message');
    hearts = document.querySelectorAll('.like-glyph');
  });

  afterEach(function() {
    sinon.restore();
    clock.restore();
    delete global.window;
    delete global.document;
    delete global.mimicServerCall;
    delete global.HTMLElement;
  });

  it('modal is hidden by default', function() {
    expect(modal.classList.contains('hidden')).to.be.true;
  });

  it('clicking an empty heart toggles it to full and adds class on success', async function() {
    mimicServerCallStub.resolves('OK');
    hearts[0].textContent = '♡';
    hearts[0].dispatchEvent(new window.Event('click', { bubbles: true }));
    await Promise.resolve(); // allow promise to resolve
    await clock.tickAsync(0);
    expect(hearts[0].textContent).to.equal('♥');
    expect(hearts[0].classList.contains('activated-heart')).to.be.true;
  });

  it('clicking a full heart toggles it to empty and removes class on success', async function() {
    mimicServerCallStub.resolves('OK');
    hearts[0].textContent = '♥';
    hearts[0].classList.add('activated-heart');
    hearts[0].dispatchEvent(new window.Event('click', { bubbles: true }));
    await Promise.resolve();
    await clock.tickAsync(0);
    expect(hearts[0].textContent).to.equal('♡');
    expect(hearts[0].classList.contains('activated-heart')).to.be.false;
  });

  it('shows modal with error message on server error, then hides after 3s', async function() {
    mimicServerCallStub.rejects('Random server error. Try again.');
    hearts[0].dispatchEvent(new window.Event('click', { bubbles: true }));
    await Promise.resolve();
    await clock.tickAsync(0);
    expect(modal.classList.contains('hidden')).to.be.false;
    expect(modalMessage.textContent).to.equal('Random server error. Try again.');
    // Modal should hide after 3 seconds
    await clock.tickAsync(3000);
    expect(modal.classList.contains('hidden')).to.be.true;
  });
});