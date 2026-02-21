/**
 * Utility functions for the application
 */

/**
 * Combines multiple class names together
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Formats a date string
 */
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
