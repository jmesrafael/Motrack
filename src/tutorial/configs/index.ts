import { registerTutorial } from '../registry';
import { dashboardTour } from './dashboard';
import {
  documentsTour,
  expensesTour,
  fuelTour,
  garageTour,
  maintenanceTour,
  repairsTour,
  searchTour,
  settingsTour,
  statisticsTour,
} from './screens';
import { documentsTip, searchTip, statisticsTip } from './tips';

/**
 * Content registration — imported once (side effect) by TutorialHost.
 * Adding a tutorial: create its config file and register it here; no engine
 * changes required.
 */
for (const config of [
  dashboardTour,
  garageTour,
  maintenanceTour,
  fuelTour,
  expensesTour,
  repairsTour,
  documentsTour,
  statisticsTour,
  searchTour,
  settingsTour,
  statisticsTip,
  searchTip,
  documentsTip,
]) {
  registerTutorial(config);
}
