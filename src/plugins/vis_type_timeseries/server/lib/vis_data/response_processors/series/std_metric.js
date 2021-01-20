/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
 */

import { getDefaultDecoration } from '../../helpers/get_default_decoration';
import { getSplits } from '../../helpers/get_splits';
import { getLastMetric } from '../../helpers/get_last_metric';
import { mapBucket } from '../../helpers/map_bucket';
import { METRIC_TYPES } from '../../../../../common/metric_types';

export function stdMetric(resp, panel, series, meta) {
  return (next) => (results) => {
    const metric = getLastMetric(series);
    if (metric.type === METRIC_TYPES.STD_DEVIATION && metric.mode === 'band') {
      return next(results);
    }

    if ([METRIC_TYPES.PERCENTILE_RANK, METRIC_TYPES.PERCENTILE].includes(metric.type)) {
      return next(results);
    }
    if (/_bucket$/.test(metric.type)) return next(results);
    const decoration = getDefaultDecoration(series);
    getSplits(resp, panel, series, meta).forEach((split) => {
      const data = split.timeseries.buckets.map(mapBucket(metric));
      results.push({
        id: `${split.id}`,
        label: split.label,
        labelFormatted: split.labelFormatted,
        color: split.color,
        data,
        ...decoration,
      });
    });
    return next(results);
  };
}
