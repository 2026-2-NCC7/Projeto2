ALTER TABLE analytics_event
    DROP CONSTRAINT IF EXISTS analytics_event_event_type_check;

ALTER TABLE analytics_event
    ADD CONSTRAINT analytics_event_event_type_check
    CHECK (event_type IN (
        'session_started',
        'product_search',
        'route_calculated',
        'route_completed',
        'product_not_found',
        'recommendation_impression',
        'recommendation_added',
        'recommendation_collected',
        'promotion_impression',
        'promotion_added',
        'promotion_collected',
        'promotion_dismissed'
    ));
