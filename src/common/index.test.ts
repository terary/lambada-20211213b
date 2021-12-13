import * as exportNonTypes from './index';
describe('common.index - export non-type', ()=>{
  it('Should export only "CONSTS" non type thing"', ()=>{
    expect(Object.keys(exportNonTypes).length).toBe(1);
    expect("CONSTS" in exportNonTypes).toBeTruthy()
  })
})
