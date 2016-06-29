import { AutoSchedulePage } from './app.po';

describe('auto-schedule App', function() {
  let page: AutoSchedulePage;

  beforeEach(() => {
    page = new AutoSchedulePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
