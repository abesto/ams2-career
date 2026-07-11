import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';

import { GoRacing } from './components/GoRacing';
import { RaceOptions } from './components/RaceOptions';
import { RaceResultFeedback } from './components/RaceResultFeedback';
import { useMainPageSlice } from './slice';
import {
  selectCurrentCarId,
  selectMainPage,
  selectSelectedRace,
} from './slice/selectors';
import { AIAdjustmentInstance } from './slice/types';

import { useCareerSlice } from 'app/slices/CareerSlice';
import { selectCareer } from 'app/slices/CareerSlice/selectors';
import { selectSettings } from 'app/slices/SettingsSlice/selectors';
import { CarId } from 'types/Car';
import { RaceResult } from 'types/Race';

interface Props {}

export function MainPage(props: Props) {
  useCareerSlice();
  const { actions: mainPageActions } = useMainPageSlice();
  const { actions: careerActions } = useCareerSlice();

  const dispatch = useDispatch();
  const career = useSelector(selectCareer);
  const slice = useSelector(selectMainPage);
  const selectedRace = useSelector(selectSelectedRace);
  const currentCarId = useSelector(selectCurrentCarId);
  const settings = useSelector(selectSettings);

  const [resultFeedbackOpen, setResultFeedbackOpen] = React.useState(false);

  React.useEffect(() => {
    if (slice.raceOptions.length === 0) {
      dispatch(mainPageActions.generateRaces({ career }));
    }
  });

  function recordResult(
    carId: CarId,
    aiLevel: number,
    aiAdjustment: AIAdjustmentInstance,
    position: number,
  ) {
    const raceResult: RaceResult = {
      ...selectedRace!,
      position,
      carId,
      aiLevel,
      racedAt: new Date().getTime(),
    };
    dispatch(careerActions.recordRaceResult({ raceResult, aiAdjustment }));
    dispatch(mainPageActions.reset());
    setResultFeedbackOpen(true);
  }

  return (
    <>
      <Helmet>
        <title>Go Race!</title>
      </Helmet>
      <Stack spacing={3}>
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, xl: 6 }}>
            <Paper sx={{ height: '100%', overflow: 'hidden' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  px: 3,
                  py: 2.5,
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ mb: 0.5 }}>
                    Current race offers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose one offer to see the setup guidance and record your
                    finishing position.
                  </Typography>
                </Box>
                {settings.canRegenerateRaces && (
                  <Button
                    variant="outlined"
                    onClick={() =>
                      dispatch(mainPageActions.generateRaces({ career }))
                    }
                  >
                    Regenerate races
                  </Button>
                )}
              </Stack>
              <RaceOptions
                races={slice.raceOptions}
                onSelect={index => dispatch(mainPageActions.selectRace(index))}
                selectedRaceIndex={slice.selectedRaceIndex}
              />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, xl: 6 }}>
            <Paper sx={{ height: '100%', p: 3 }}>
              {selectedRace !== null ? (
                <>
                  <Typography variant="h5" sx={{ mb: 0.5 }}>
                    Race setup and results
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Review the suggested settings, adjust AI if needed, then
                    record the result once the race is done.
                  </Typography>
                  <GoRacing
                    race={selectedRace!}
                    career={career}
                    currentCarId={currentCarId!}
                    onRecord={(aiLevel, aiAdjustment, position) =>
                      recordResult(
                        currentCarId!,
                        aiLevel,
                        aiAdjustment!,
                        position,
                      )
                    }
                    onCarSelect={carId =>
                      dispatch(
                        mainPageActions.selectCar({
                          carClassId: selectedRace!.carClassId,
                          carId,
                        }),
                      )
                    }
                  />
                </>
              ) : (
                <Stack
                  spacing={1.5}
                  sx={{
                    justifyContent: 'center',
                    minHeight: 320,
                  }}
                >
                  <Typography variant="h5">
                    Select a race to continue
                  </Typography>
                  <Typography color="text.secondary">
                    The right-hand side will show the current discipline
                    progress, race details, AI adjustments, and result entry
                    once you choose an offer.
                  </Typography>
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Stack>
      <RaceResultFeedback
        open={resultFeedbackOpen}
        onClose={() => setResultFeedbackOpen(false)}
        career={career}
      />
    </>
  );
}
