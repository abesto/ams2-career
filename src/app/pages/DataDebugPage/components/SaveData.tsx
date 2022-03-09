import saveAs from 'file-saver';
import * as React from 'react';
import { availableVersions, load } from 'store/saveload';

import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

interface Props {}

export function SaveData(props: Props) {
  const [tab, setTab] = React.useState(0);
  const saves = availableVersions();
  const selectedSave = saves[tab];

  if (!selectedSave) {
    return null;
  }

  return (
    <>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        {saves.map((save, i) => (
          <Tab key={i} label={save} />
        ))}
      </Tabs>

      <Button
        onClick={() =>
          saveAs(
            new Blob([localStorage.getItem(selectedSave)!], {
              type: 'application/octet-stream',
            }),
            selectedSave.replaceAll(':', '-') + '.ams2career',
          )
        }
        variant="contained"
        sx={{ my: 2 }}
      >
        Download
      </Button>
      <pre>{JSON.stringify(load(false, selectedSave), null, 2)}</pre>
    </>
  );
}
