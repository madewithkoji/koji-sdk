/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line func-names
(function () {
  const baseUrl = 'https://withkoji.com';
  const overlayStyle = [
    'outline: none;',
    'border: none;',
    'position: fixed;',
    'top: 0;',
    'left: 0;',
    'width: 100vw;',
    'height: 100vh;',
    'z-index: 8675309;',
    'transition: opacity 0.2s ease-in-out;',
    'pointer-events: none;',
    'opacity: 0;',
  ].join(' ');

  const createOverlayId = 'koji-create-root';
  const getOverlay = () => document.getElementById(createOverlayId);

  const feedId = 'koji-feed-root';
  const getFeed = () => document.getElementById(feedId);

  const collectionId = 'koji-root';
  const getCollection = () => document.getElementById(collectionId);

  const sendMessage = (target, eventName, message = {}) => {
    try {
      target.contentWindow.postMessage({
        _kojiEventName: eventName,
        ...message,
      }, '*');
    } catch (err) {
      console.log(err);
    }
  };

  const initialize = () => {
    // Setup listener for SDK
    window.addEventListener('message', ({ data }) => {
      try {
        // Collection frame has loaded
        if (data._kojiEventName === '@@koji_sdk/collection/LOADED') {
          // ack
          sendMessage(getCollection(), '@@koji_sdk/collection/INITIALIZE');
        }

        // Collection frame has requested to show the create overlay
        if (data._kojiEventName === '@@koji_sdk/collection/SHOW_PICKER') {
          const { x, y, width, height } = getCollection().getBoundingClientRect();
          const overlay = getOverlay();
          sendMessage(overlay, '@@koji_sdk/create/SHOW_PICKER', {
            top: y + 72,
            left: x - 14,
            origin: `${(x + width) - 72}px ${y + 72}px`,
          });
          overlay.style.opacity = '1';
          overlay.style.pointerEvents = 'all';
          document.body.style.overflow = 'hidden';
        }

        // Collection frame has requested to show a feed
        if (data._kojiEventName === '@@koji_sdk/collection/SHOW_FEED') {
          const { feedData, currentAppPath } = data.payload;
          const frame = getFeed();
          sendMessage(frame, '@@koji_sdk/feed/INITIALIZE', {
            feedData,
            currentAppPath,
          });
          frame.style.opacity = '1';
          frame.style.pointerEvents = 'all';
          document.body.style.overflow = 'hidden';
        }

        // Create overlay has loaded
        if (data._kojiEventName === '@@koji_sdk/create/LOADED') {
          const { tag } = getCollection().dataset;
          sendMessage(getOverlay(), '@@koji_sdk/create/INITIALIZE', {
            defaultDescription: `#${tag}`,
          });
        }

        // Create overlay should dismiss
        if (data._kojiEventName === '@@koji_sdk/create/DISMISS') {
          const frame = getOverlay();
          frame.style.opacity = '0';
          frame.style.pointerEvents = 'none';
          document.body.style.overflow = 'auto';
        }

        // Create overlay did create post
        if (data._kojiEventName === '@@koji_sdk/create/POST_CREATED') {
          // Hide the overlay
          const frame = getOverlay();
          frame.style.opacity = '0';
          frame.style.pointerEvents = 'none';
          document.body.style.overflow = 'auto';

          // Do something with the result
          // const { url, title } = data.payload;
          sendMessage(getCollection(), '@@koji_sdk/collection/POST_CREATED');
        }

        // Feed should dismiss
        if (data._kojiEventName === '@@koji_sdk/feed/DISMISS') {
          const frame = getFeed();
          frame.style.opacity = '0';
          frame.style.pointerEvents = 'none';
          document.body.style.overflow = 'auto';
        }
      } catch (err) {
        //
      }
    });

    // Create frame (overlay)
    const createOverlay = document.createElement('iframe');
    createOverlay.id = createOverlayId;
    createOverlay.src = `${baseUrl}/_embeds/create`;
    createOverlay.style = overlayStyle;
    document.body.appendChild(createOverlay);

    // Feed frame (overlay)
    const feedOverlay = document.createElement('iframe');
    feedOverlay.id = feedId;
    feedOverlay.src = `${baseUrl}/_embeds/feed`;
    feedOverlay.style = overlayStyle;
    document.body.appendChild(feedOverlay);

    // Collection frame
    const collection = document.createElement('iframe');
    collection.id = collectionId;
    const {
      tag,
      width,
      height,
      color,
    } = getCollection().dataset;
    collection.src = `${baseUrl}/_embeds/collection?tag=${encodeURIComponent(tag)}&color=${encodeURIComponent(color)}`;

    let resolvedWidth = width || '400';
    if (resolvedWidth.indexOf('%') === -1) {
      resolvedWidth = `${resolvedWidth}px`;
    }

    let resolvedHeight = height || '600';
    if (resolvedHeight.indexOf('%') === -1) {
      resolvedHeight = `${resolvedHeight}px`;
    }

    collection.style = [
      'outline: none;',
      'border: none;',
      `width: ${resolvedWidth};`,
      `max-width: 100%;`,
      `height: ${resolvedHeight};`,
      'pointer-events: all;',
    ].join(' ');
    collection.dataset.tag = tag;
    const collectionRoot = getCollection();
    collectionRoot.parentNode.replaceChild(collection, collectionRoot);
  };

  initialize();
}());
