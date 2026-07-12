import { metaClassMappingFor } from './importGameData';

describe('metaClassMappingFor', () => {
  it('uses the existing app class for Hot Cars', () => {
    expect(metaClassMappingFor('Hot Cars', 'GT', 'GT')).toEqual({
      metaClass: 'Hot Cars',
      source: 'explicit-alias',
    });
  });

  it('records aliases after handling game downforce suffixes', () => {
    expect(metaClassMappingFor('GT3_Gen2_LD', 'GT3', 'GT')).toEqual({
      metaClass: 'GT3',
      source: 'explicit-alias',
    });
  });

  it('keeps fallback rules explicitly heuristic', () => {
    expect(metaClassMappingFor('SafetyCar', 'GT', 'Road')).toEqual({
      metaClass: 'Street Cars A',
      source: 'heuristic-family',
    });
  });
});
