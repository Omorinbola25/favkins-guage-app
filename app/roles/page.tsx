'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Clock, ChevronRight } from 'lucide-react';
import { roles } from '../libs/role';
import AppLayout from '@/components/AppLayout';
import RoleCategoryIcon from '@/components/ui/RoleCategoryIcon';

const difficultyColors = {
  beginner: 'bg-success/20 text-success border-success/30',
  intermediate: 'bg-warning/20 text-warning border-warning/30',
  advanced: 'bg-danger/20 text-danger border-danger/30',
};

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(roles.map((r) => r.category))];

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? role.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold">Choose Your Interview</h1>
          <p className="text-muted-foreground mt-1">
            Select a role to start practicing with AI-powered feedback
          </p>
        </div>

        {/* Search and filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Search roles (e.g., 'Software', 'Product', 'Design')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              aria-pressed={selectedCategory === null}
              className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
                  : 'bg-muted text-muted-foreground hover:bg-card-elevated hover:text-foreground'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
                    : 'bg-muted text-muted-foreground hover:bg-card-elevated hover:text-foreground'
                }`}
              >
                {cat === 'All' ? null : <RoleCategoryIcon category={cat} size={15} />}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Role grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <Link
              key={role.id}
              href={`/interview-session-screen?role=${role.id}`}
              aria-label={`Practise ${role.title}, ${role.questionCount} questions, about ${role.estimatedTime}`}
              className="bg-card border-border hover:border-primary/50 hover:bg-card-elevated hover:shadow-primary/10 group block rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-muted/50 text-primary group-hover:bg-primary/15 flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200">
                    <RoleCategoryIcon category={role.category} size={20} />
                  </span>
                  <div>
                    <h3 className="text-foreground group-hover:text-primary font-semibold transition-colors duration-200">
                      {role.title}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${difficultyColors[role.difficulty]}`}
                      >
                        {role.difficulty}
                      </span>
                      <span className="text-muted-foreground text-xs">{role.category}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-all duration-200 group-hover:translate-x-1"
                />
              </div>

              <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{role.description}</p>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="text-muted-foreground border-border flex items-center justify-between border-t pt-3 text-xs">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {role.estimatedTime}
                </span>
                <span>{role.questionCount} questions</span>
              </div>
            </Link>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="py-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">No roles found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
