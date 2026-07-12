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

  it('uses the explicit app class for safety cars', () => {
    expect(metaClassMappingFor('SafetyCar', 'GT', 'Road')).toEqual({
      metaClass: 'Street Cars A',
      source: 'explicit-alias',
    });
  });

  it('maps game-specific cup and challenge classes to the matching app classes', () => {
    expect(metaClassMappingFor('GTCupN', 'GT3', 'GT')).toEqual({
      metaClass: 'Carrera Cup',
      source: 'explicit-alias',
    });
    expect(metaClassMappingFor('MiniChallenge', 'GT', 'GT')).toEqual({
      metaClass: 'JCW',
      source: 'explicit-alias',
    });
  });

  it('splits the mixed LES 2025 family by its actual vehicle group', () => {
    expect(metaClassMappingFor('LES_2025', 'LMP4', 'Prototype')).toEqual({
      metaClass: 'P4',
      source: 'explicit-alias',
    });
    expect(metaClassMappingFor('LES_2025', 'GT4', 'GT')).toEqual({
      metaClass: 'GT4',
      source: 'explicit-alias',
    });
  });
});
