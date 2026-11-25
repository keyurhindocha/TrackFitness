import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ProgressScreen from '../ProgressScreen';
import { getWorkouts } from '../../storage/storage';

jest.mock('../../storage/storage', () => ({ getWorkouts: jest.fn() }));

// Run the focus effect once on mount, as if the tab had just been opened.
jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return { useFocusEffect: (cb) => useEffect(cb, [cb]) };
});

const ex = (name, weight) => ({ name, sets: [{ weight: String(weight), reps: '10' }] });

const WORKOUTS = [
  { id: '2', date: '2026-11-05', exercises: [ex('Bench Press', 95), ex('Leg extension', 80), ex('Seated leg curl', 80)] },
  { id: '1', date: '2026-11-01', exercises: [ex('Bench Press', 90), ex('Leg extension', 100), ex('Lat pulldown', 70)] },
];
const ALL = ['Bench Press', 'Leg extension', 'Seated leg curl', 'Lat pulldown'];

const renderScreen = async (workouts = WORKOUTS) => {
  getWorkouts.mockResolvedValue(workouts);
  const navigation = { navigate: jest.fn() };
  // Let the stored workouts load before the test looks at the screen.
  render(<ProgressScreen navigation={navigation} />);
  await act(async () => {});
  return navigation;
};

const shownNames = () => ALL.filter((n) => screen.queryByText(n));

describe('ProgressScreen', () => {
  // FlatList renders off-screen rows on a timer; fake timers keep those
  // updates from landing after a test has finished.
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('lists every exercise with its stats', async () => {
    await renderScreen();
    await screen.findByText('Bench Press');
    expect(shownNames()).toEqual(ALL);
    expect(screen.getByText('20 lbs vs last')).toBeTruthy(); // Leg extension 100 -> 80
    expect(screen.getByText('5 lbs vs last')).toBeTruthy(); // Bench Press 90 -> 95
    expect(screen.getByText('100 lbs')).toBeTruthy();
  });

  it('shows the empty state, and no search bar, with no workouts', async () => {
    await renderScreen([]);
    await screen.findByText('No data yet');
    expect(screen.queryByPlaceholderText('Search exercises')).toBeNull();
  });

  it('filters the list as you type, ignoring case', async () => {
    await renderScreen();
    fireEvent.changeText(await screen.findByPlaceholderText('Search exercises'), 'LEG');
    expect(shownNames()).toEqual(['Leg extension', 'Seated leg curl']);
  });

  it('shows "No matches" when nothing fits the search', async () => {
    await renderScreen();
    fireEvent.changeText(await screen.findByPlaceholderText('Search exercises'), 'xyz');
    expect(shownNames()).toEqual([]);
    expect(screen.getByText('No matches')).toBeTruthy();
    expect(screen.getByText('No exercise matches "xyz"')).toBeTruthy();
    expect(screen.queryByText('No data yet')).toBeNull();
  });

  it('shows the clear button only while there is text, and clearing restores the list', async () => {
    await renderScreen();
    const input = await screen.findByPlaceholderText('Search exercises');
    expect(screen.queryByLabelText('Clear search')).toBeNull();

    fireEvent.changeText(input, 'bench');
    expect(shownNames()).toEqual(['Bench Press']);

    fireEvent.press(screen.getByLabelText('Clear search'));
    expect(input.props.value).toBe('');
    expect(shownNames()).toEqual(ALL);
    expect(screen.queryByLabelText('Clear search')).toBeNull();
  });

  it('opens the detail screen for a card picked from search results', async () => {
    const navigation = await renderScreen();
    fireEvent.changeText(await screen.findByPlaceholderText('Search exercises'), 'pull');
    fireEvent.press(screen.getByText('Lat pulldown'));
    expect(navigation.navigate).toHaveBeenCalledWith('ProgressDetail', { exerciseName: 'Lat pulldown' });
  });

  it('uses 16px or larger search text so iPhone Safari does not zoom in', async () => {
    await renderScreen();
    const input = await screen.findByPlaceholderText('Search exercises');
    expect(StyleSheet.flatten(input.props.style).fontSize).toBeGreaterThanOrEqual(16);
  });
});
