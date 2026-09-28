import React from 'react';

export function ProjectSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-surface2 rounded w-1/4"></div>
        <div className="h-4 bg-surface2 rounded w-12"></div>
      </div>
      <div className="h-6 bg-surface2 rounded w-3/4"></div>
      <div className="h-4 bg-surface2 rounded w-full"></div>
      <div className="h-4 bg-surface2 rounded w-5/6"></div>
      <div className="flex gap-2 pt-4">
        <div className="h-5 bg-surface2 rounded w-14"></div>
        <div className="h-5 bg-surface2 rounded w-16"></div>
        <div className="h-5 bg-surface2 rounded w-12"></div>
      </div>
    </div>
  );
}

export function ServiceSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 animate-pulse space-y-4">
      <div className="h-5 bg-surface2 rounded w-12"></div>
      <div className="h-6 bg-surface2 rounded w-2/3"></div>
      <div className="h-4 bg-surface2 rounded w-full"></div>
      <div className="h-4 bg-surface2 rounded w-4/5"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-surface2 rounded w-3/4"></div>
        <div className="h-3 bg-surface2 rounded w-2/3"></div>
      </div>
    </div>
  );
}
