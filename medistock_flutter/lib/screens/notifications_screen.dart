import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../app_theme.dart';
import '../providers/medication_provider.dart';
import '../models/medication.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Consumer<MedicationProvider>(
      builder: (context, provider, child) {
        return Scaffold(
          backgroundColor: theme.scaffoldBackgroundColor,
          body: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Notifications',
                        style: AppTheme.heading2,
                      ),
                      const Spacer(),
                      if (provider.unreadCount > 0)
                        TextButton(
                          onPressed: () => _markAllRead(provider),
                          child: Text(
                            'Mark all read',
                            style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.w600),
                          ),
                        ),
                    ],
                  ),
                ),
                // Notifications List
                Expanded(
                  child: provider.notifications.isEmpty
                      ? _buildEmptyState(context)
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: provider.notifications.length,
                          itemBuilder: (context, index) {
                            final notification = provider.notifications[index];
                            return _buildNotificationCard(context, notification, provider);
                          },
                        ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    NotificationItem notification,
    MedicationProvider provider,
  ) {
    final theme = Theme.of(context);
    final icon = _getNotificationIcon(notification.type);
    final color = _getNotificationColor(context, notification.type);

    return GestureDetector(
      onTap: () {
        if (!notification.read) {
          provider.markNotificationRead(notification.id);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: notification.read ? theme.cardColor : color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: notification.read ? theme.dividerColor : color.withValues(alpha: 0.3),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: AppTheme.body.copyWith(
                            fontWeight: notification.read
                                ? FontWeight.normal
                                : FontWeight.w600,
                          ),
                        ),
                      ),
                      if (!notification.read)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: theme.primaryColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.body,
                    style: AppTheme.bodySmall.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _formatTime(notification.createdAt),
                    style: AppTheme.caption.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'reminder':
        return Icons.alarm;
      case 'missed':
        return Icons.warning_amber;
      case 'success':
        return Icons.check_circle;
      case 'info':
        return Icons.info_outline;
      default:
        return Icons.notifications;
    }
  }

  Color _getNotificationColor(BuildContext context, String type) {
    final theme = Theme.of(context);
    switch (type) {
      case 'reminder':
        return theme.primaryColor;
      case 'missed':
        return AppTheme.danger;
      case 'success':
        return AppTheme.success;
      case 'info':
        return AppTheme.warning;
      default:
        return theme.colorScheme.onSurfaceVariant;
    }
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('MMM d').format(date);
  }

  void _markAllRead(MedicationProvider provider) {
    for (final notification in provider.notifications) {
      if (!notification.read) {
        provider.markNotificationRead(notification.id);
      }
    }
  }

  Widget _buildEmptyState(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none,
            size: 64,
            color: theme.colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'No notifications',
            style: AppTheme.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            'You\'re all caught up!',
            style: AppTheme.bodySmall.copyWith(color: theme.colorScheme.onSurfaceVariant),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
