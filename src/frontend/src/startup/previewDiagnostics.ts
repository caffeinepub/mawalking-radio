// Preview diagnostics overlay for capturing and displaying startup errors
// This runs before React mounts to catch early failures

interface DiagnosticError {
  type: 'resource' | 'script' | 'rejection' | 'sw';
  message: string;
  url?: string;
  timestamp: number;
}

class PreviewDiagnostics {
  private errors: DiagnosticError[] = [];
  private overlayShown = false;
  private criticalErrorThreshold = 2; // Show overlay after 2 critical errors (more lenient for draft)

  constructor() {
    this.init();
  }

  private init() {
    // Collect errors from early boot script
    if (window.__startupDiagnostics) {
      const diag = window.__startupDiagnostics;
      
      diag.resourceErrors?.forEach((err: any) => {
        this.addError({
          type: 'resource',
          message: `Failed to load ${err.type}: ${err.src}`,
          url: err.src,
          timestamp: err.timestamp,
        });
      });
      
      diag.scriptErrors?.forEach((err: any) => {
        this.addError({
          type: 'script',
          message: err.message,
          url: err.filename,
          timestamp: err.timestamp,
        });
      });
      
      diag.unhandledRejections?.forEach((err: any) => {
        // Only treat rejections as critical if they're not service worker related
        if (!err.reason || !err.reason.toString().toLowerCase().includes('service worker')) {
          this.addError({
            type: 'rejection',
            message: err.reason,
            timestamp: err.timestamp,
          });
        }
      });

      diag.swErrors?.forEach((err: any) => {
        // Service worker errors are non-critical for draft
        console.warn('[Preview Diagnostics] Service worker error (non-critical):', err);
      });
    }

    // Show overlay only if critical errors detected
    if (this.hasCriticalErrors()) {
      console.error('[Preview Diagnostics] Critical startup errors detected:', this.errors);
      this.showOverlay();
    } else if (this.errors.length > 0) {
      console.warn('[Preview Diagnostics] Non-critical startup errors detected:', this.errors);
    }
  }

  private addError(error: DiagnosticError) {
    this.errors.push(error);
  }

  private hasCriticalErrors(): boolean {
    // Only resource errors and script errors are critical
    // Service worker and rejection errors are non-critical for draft
    const criticalErrors = this.errors.filter(
      e => e.type === 'resource' || e.type === 'script'
    );
    return criticalErrors.length >= this.criticalErrorThreshold;
  }

  private showOverlay() {
    if (this.overlayShown) return;
    this.overlayShown = true;

    // Use the app shell recovery UI
    if (window.__showAppShellRecovery) {
      const criticalCount = this.errors.filter(
        e => e.type === 'resource' || e.type === 'script'
      ).length;
      
      const errorSummary = this.errors
        .map(e => `${e.type.toUpperCase()}: ${e.message}`)
        .join('\n');
      
      let message = `The app encountered ${this.errors.length} error${this.errors.length > 1 ? 's' : ''} during startup`;
      
      if (criticalCount > 0) {
        message += ` (${criticalCount} critical)`;
      }
      
      message += '. Please try reloading or resetting the app.';
      
      window.__showAppShellRecovery(message);
    }
  }

  public getErrors(): DiagnosticError[] {
    return [...this.errors];
  }

  public getDiagnosticsSummary(): string {
    if (this.errors.length === 0) {
      return 'No startup errors detected';
    }

    const summary = [
      `=== Startup Diagnostics ===`,
      `Total errors: ${this.errors.length}`,
      `Critical errors: ${this.errors.filter(e => e.type === 'resource' || e.type === 'script').length}`,
      '',
      ...this.errors.map(e => `[${e.type.toUpperCase()}] ${e.message}${e.url ? ` (${e.url})` : ''}`)
    ];

    return summary.join('\n');
  }
}

// Initialize diagnostics
const diagnostics = new PreviewDiagnostics();

// Export for use in other modules
export default diagnostics;

// Make available globally for debugging
declare global {
  interface Window {
    __previewDiagnostics?: PreviewDiagnostics;
    __startupDiagnostics?: {
      scriptErrors: any[];
      resourceErrors: any[];
      unhandledRejections: any[];
      swErrors: any[];
      timestamp: number;
    };
    __startupErrors?: any[];
    __showAppShellRecovery?: (message: string) => void;
    __clearReactMountTimeout?: () => void;
    __reactMountTimeout?: number;
  }
}

window.__previewDiagnostics = diagnostics;
