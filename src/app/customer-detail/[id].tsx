// Re-exports customer detail for cross-tab navigation.
// Pushing to /customer-detail/[id] stays on the root stack so back pops correctly.
export { default } from '../(main)/customers/[id]';
