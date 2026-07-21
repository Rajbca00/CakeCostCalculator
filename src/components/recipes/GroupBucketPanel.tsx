import { BUCKET_LABELS, COST_BUCKETS, type CostBucket } from '../../types';
import { resolveGroupBucket } from '../../lib/groupBucket';
import { Select } from '../common/Select';

interface GroupBucketPanelProps {
  groupNames: string[];
  groupBuckets: Record<string, CostBucket> | undefined;
  onChange: (groupBuckets: Record<string, CostBucket>) => void;
}

/** Lets the user assign a cost-breakdown bucket once per group name, instead of per line. */
export function GroupBucketPanel({ groupNames, groupBuckets, onChange }: GroupBucketPanelProps) {
  if (groupNames.length === 0) return null;

  function setBucket(groupName: string, bucket: CostBucket) {
    onChange({ ...groupBuckets, [groupName]: bucket });
  }

  return (
    <div className="flex flex-col gap-2">
      {groupNames.map((name) => (
        <div
          key={name}
          className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 p-2"
        >
          <span className="min-w-[8rem] flex-1 text-sm font-medium text-slate-700">{name}</span>
          <Select
            label="Cost bucket"
            value={resolveGroupBucket(name, { groupBuckets })}
            onChange={(e) => setBucket(name, e.target.value as CostBucket)}
            className="w-40"
          >
            {COST_BUCKETS.map((bucket) => (
              <option key={bucket} value={bucket}>
                {BUCKET_LABELS[bucket]}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );
}
