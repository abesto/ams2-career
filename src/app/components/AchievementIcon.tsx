import * as React from 'react';

import { EmojiEvents, EmojiEventsOutlined } from '@mui/icons-material';

import { AchievementLevel } from 'app/slices/CareerSlice/achievements';

const achievementColors = {
  [AchievementLevel.Bronze]: 'rgb(130, 57, 62)',
  [AchievementLevel.Silver]: 'rgb(209, 198, 156)',
  [AchievementLevel.Gold]: 'rgb(244, 150, 22)',
  [AchievementLevel.Platinum]: 'rgb(42, 54, 84)',
};

export function AchievementIcon(props: {
  level: AchievementLevel;
  unlocked: boolean;
  fontSize?: 'small' | 'inherit' | 'large';
}) {
  const { level, unlocked } = props;
  const fontSize = props.fontSize || 'inherit';
  if (unlocked) {
    return (
      <EmojiEvents
        fontSize={fontSize}
        sx={{
          color: achievementColors[level],
        }}
      />
    );
  } else {
    return <EmojiEventsOutlined fontSize={fontSize} sx={{ color: 'gray' }} />;
  }
}
