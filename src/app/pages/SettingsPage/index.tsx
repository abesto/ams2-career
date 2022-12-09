import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import {
  DECLINED,
  GRANTED,
  useCookieConsentValue,
} from 'app/components/OurCookieConsent';
import {
  initialState as initialSettings,
  useSettingsSlice,
} from 'app/slices/SettingsSlice';
import { selectSettings } from 'app/slices/SettingsSlice/selectors';

export function SettingsPage() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const actions = useSettingsSlice().actions;
  const [cookieConsentValue, setCookieConsentValue] = useCookieConsentValue();

  return (
    <>
      <Helmet>
        <title>Settings</title>
      </Helmet>

      <Box sx={{ flexGrow: 1, m: 2 }}>
        <Typography variant="h4">Settings</Typography>
        <Typography>
          Here you can customize various aspects of your AMS2 Career experience.
          Note that all changes are applied immediately and retroactively, but
          you can always set things back to the way they were before without
          losing anything.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Cross-Discipline XP</Typography>
            <Typography>
              Usually race results earn you some small amount of XP in
              disciplines other than the one you raced in, based on how similar
              they are to each other, and their relative difficulty. You may
              want to disable this if you want to climb the ladders of multiple
              racing disciplines start to finish.
            </Typography>
            <FormGroup row>
              <FormControlLabel
                label="Enable Cross-Discipline XP"
                control={
                  <Checkbox
                    checked={
                      settings.crossDisciplineGainsEnabled ??
                      initialSettings.crossDisciplineGainsEnabled
                    }
                    onChange={e =>
                      dispatch(
                        actions.setCrossDisciplineGainsEnabled(
                          e.target.checked,
                        ),
                      )
                    }
                  />
                }
              />
              <Button
                color="secondary"
                onClick={() =>
                  dispatch(actions.resetCrossDisciplineGainsEnabled())
                }
              >
                Reset
              </Button>
            </FormGroup>
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">XP Multiplier</Typography>
            <Typography>
              This option applies a flat multiplier to all XP points earned. You
              can use this to tweak how long your career is.
            </Typography>
            <FormGroup row sx={{ mt: 1 }}>
              <TextField
                type="number"
                inputProps={{
                  min: 0.1,
                  step: 0.1,
                }}
                value={settings.xpMultiplier ?? initialSettings.xpMultiplier}
                size="small"
                sx={{ width: '200px' }}
                onChange={e =>
                  dispatch(actions.setXpMultiplier(parseFloat(e.target.value)))
                }
              />
              <Button onClick={() => dispatch(actions.setXpMultiplier(1.5))}>
                Short Career
              </Button>
              <Button
                color="secondary"
                onClick={() => dispatch(actions.resetXpMultiplier())}
              >
                Default
              </Button>
              <Button onClick={() => dispatch(actions.setXpMultiplier(0.5))}>
                Long Career
              </Button>
            </FormGroup>
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Position XP Multiplier</Typography>
            <Typography>
              This option controls how heavily your finishing position
              influences the amount of XP points earned. <code>1.0</code> is the
              default; lower values mean your race results matter less. At{' '}
              <code>0.0</code>, you'll get the same amount of XP for finishing a
              race, no matter your result. Conversely, at very high values you
              get a LOT of XP for winning, and possibly none at all for poor
              results.
            </Typography>
            <FormGroup row sx={{ mt: 1 }}>
              <TextField
                type="number"
                inputProps={{
                  min: 0.0,
                  step: 0.1,
                }}
                value={
                  settings.positionXpMultiplier ??
                  initialSettings.positionXpMultiplier
                }
                size="small"
                sx={{ width: '200px' }}
                onChange={e =>
                  dispatch(
                    actions.setPositionXpMultiplier(parseFloat(e.target.value)),
                  )
                }
              />
              <Button
                color="secondary"
                onClick={() => dispatch(actions.resetPositionXpMultiplier())}
              >
                Default
              </Button>
            </FormGroup>
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Cookies</Typography>
            <Typography>
              We use Google Analytics to understand how many people use this
              app, and to understand a bit of your usage patterns. It helps us a
              lot, but your privacy is your privacy. If you do enable this, then
              please also disable any adblocker extension for this site
              (otherwise we still won't get the data).
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={cookieConsentValue}
              onChange={(e, value) => setCookieConsentValue(value)}
              sx={{ mt: 2 }}
              size="small"
            >
              <ToggleButton value={GRANTED}>Grant</ToggleButton>
              <ToggleButton value={DECLINED}>Deny</ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Regenerate Races</Typography>
            <Typography>
              This option allows you to click a button on the "Go Race!" page to
              regenerate the currently available races. Normally we recommend
              leaving this disabled, but it can be especially useful to ensure
              you have races with content you own if you don't have all the
              DLCs.
            </Typography>
            <FormControlLabel
              label="Enable Regenerating Races"
              control={
                <Checkbox
                  inputProps={{
                    // @ts-ignore
                    'data-testid': 'regenerate-races',
                  }}
                  checked={
                    settings.canRegenerateRaces ??
                    initialSettings.canRegenerateRaces
                  }
                  onChange={e =>
                    dispatch(actions.setCanRegenerateRaces(e.target.checked))
                  }
                />
              }
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
