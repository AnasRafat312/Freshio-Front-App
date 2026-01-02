import { EntityEnumsToStringPipe } from './entity-enums-to-string.pipe';

describe('EntityEnumsToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new EntityEnumsToStringPipe();
    expect(pipe).toBeTruthy();
  });
});
