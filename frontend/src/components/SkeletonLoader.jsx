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

export function FaqSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 w-3/4">
            <div className="w-5 h-5 rounded-full bg-surface2 shrink-0"></div>
            <div className="h-5 bg-surface2 rounded w-5/6"></div>
          </div>
          <div className="w-4 h-4 rounded bg-surface2 shrink-0"></div>
        </div>
      ))}
    </div>
  );
}

export function TierSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-7 sm:p-8 space-y-5">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-surface2 rounded w-20"></div>
            <div className="h-4 bg-surface2 rounded w-24"></div>
          </div>
          <div className="h-6 bg-surface2 rounded w-3/4"></div>
          <div className="h-4 bg-surface2 rounded w-full"></div>
          <div className="h-8 bg-surface2 rounded w-1/2"></div>
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-4 bg-surface2 rounded w-5/6"></div>
            ))}
          </div>
          <div className="h-10 bg-surface2 rounded w-full mt-4"></div>
        </div>
      ))}
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-6 sm:p-7 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-surface2 rounded w-20"></div>
          </div>
          <div className="h-4 bg-surface2 rounded w-full"></div>
          <div className="h-4 bg-surface2 rounded w-5/6"></div>
          <div className="h-4 bg-surface2 rounded w-2/3"></div>
          <div className="pt-4 border-t border-border flex justify-between">
            <div className="h-4 bg-surface2 rounded w-28"></div>
            <div className="h-3 bg-surface2 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RoadmapSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 animate-pulse space-y-6">
      <div className="h-6 bg-surface2 rounded w-48 mb-2"></div>
      <div className="h-8 bg-surface2 rounded w-2/3 mb-4"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-surface2 rounded-xl"></div>
        ))}
      </div>
      <div className="h-44 bg-surface2/60 rounded-xl"></div>
    </div>
  );
}

export function ComparisonSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-10 animate-pulse space-y-6">
      <div className="h-6 bg-surface2 rounded w-36 mx-auto mb-2"></div>
      <div className="h-8 bg-surface2 rounded w-1/2 mx-auto mb-6"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-surface2/60 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

